import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "./TemplateHeader"; // same folder: components/customization
import CustomizeSidebar from "./Customizesidebar";
import CustomizeStage from "./Customizestage";
import CustomizePanel from "./Customizepanel";
import templateService from "../../services/CakeTemplateService";
import decorationService from "../../services/admindecorationService";
import cartService from "../../services/cartService";
import { addToGuestCart, getGuestCartCount } from "../../services/guestCartService";
import { mapApiTemplateToViewModel } from "../../utils/mapApiTemplate";
import { initialConfig, calcPrice } from "../../data/Options";
import "../../styles/template.css";
import "../../styles/Customize.css";
import "../../styles/customizeresponsive.css"; // must stay last

// matches the route in App.jsx
const templatePage = (cakeId) =>
  cakeId ? `/design-by-template/${cakeId}` : "/design-by-template";

const getToken = () =>
  localStorage.getItem("token") || sessionStorage.getItem("token");

const countItems = (cart) =>
  (cart?.items || []).reduce((total, item) => total + (item.quantity || 0), 0);

/**
 * Media queries only work when the page has a viewport meta tag.
 * If index.html forgot it, add it here so phones don't render at ~980px.
 */
function useEnsureViewportMeta() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", "width=device-width, initial-scale=1");
  }, []);
}

export default function CustomizePage() {
  const { cakeId, templateId } = useParams();
  const { state } = useLocation();

  useEnsureViewportMeta();

  const [templateState, setTemplateState] = useState(() => ({
    templateId,
    template: null,
    loading: Boolean(templateId),
    error: null,
  }));

  useEffect(() => {
    let isMounted = true;

    // /customize/:cakeId has no templateId -> send the user to pick one
    if (!templateId) {
      return undefined;
    }

    templateService
      .getTemplateById(templateId)
      .then((data) => {
        if (isMounted) {
          setTemplateState({
            templateId,
            template: mapApiTemplateToViewModel(data),
            loading: false,
            error: null,
          });
        }
      })
      .catch((err) => {
        if (isMounted) {
          setTemplateState({
            templateId,
            template: null,
            loading: false,
            error: err.message || "Failed to load template.",
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [templateId]);

  const isCurrentTemplate = templateState.templateId === templateId;
  const template = isCurrentTemplate ? templateState.template : null;
  const loading = Boolean(templateId) && (!isCurrentTemplate || templateState.loading);
  const error = isCurrentTemplate ? templateState.error : null;

  if (templateId && loading) {
    return (
      <div className="cz">
        <Header step={2} leftTitle="Customize" rightTitle="" variant="customize" />
        <div className="cz-loading">Loading template...</div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <Navigate
        to={templatePage(cakeId)}
        replace
        state={{ cake: state?.cake }}
      />
    );
  }

  return (
    <Customizer
      key={template.id}
      template={template}
      cakeId={cakeId}
      cake={state?.cake}
      initialColorId={state?.colorId}
    />
  );
}

function Customizer({ template, cakeId, cake, initialColorId }) {
  const navigate = useNavigate();
  const cakeIdNum = cakeId && cakeId !== "undefined" ? Number(cakeId) : null;

  const [baseline] = useState(() => initialConfig(template, initialColorId));
  const [cfg, setCfg] = useState(baseline);

  const [added, setAdded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const [decorations, setDecorations] = useState([]);
  const [decorationsLoading, setDecorationsLoading] = useState(true);
  const [decorationsError, setDecorationsError] = useState("");

  const toastTimer = useRef(null);

  useEffect(() => {
    let ignore = false;

    const loadDecorations = async () => {
      setDecorationsLoading(true);
      setDecorationsError("");
      try {
        const data = await decorationService.getDecorations();
        const list = Array.isArray(data) ? data : data?.items;
        if (!ignore) setDecorations(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!ignore) setDecorationsError(err.message || "Failed to load decorations.");
      } finally {
        if (!ignore) setDecorationsLoading(false);
      }
    };

    loadDecorations();
    return () => {
      ignore = true;
    };
  }, []);

  // Load existing cart count on mount
  useEffect(() => {
    let ignore = false;

    const loadInitialCartCount = async () => {
      if (!getToken()) {
        setCartCount(getGuestCartCount());
        return;
      }

      try {
        const cart = await cartService.getCart();
        if (!ignore) setCartCount(countItems(cart));
      } catch {
        console.error("Failed to load customer cart");
      }
    };

    loadInitialCartCount();
    return () => {
      ignore = true;
    };
  }, []);

  // clear the toast timer when leaving the page
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  const update = (patch) => {
    setAdded(false);
    setCfg((current) => ({ ...current, ...patch }));
  };

  const price = useMemo(() => calcPrice(template, cfg, decorations), [template, cfg, decorations]);

  const changeTemplate = () =>
    navigate(templatePage(cakeId), {
      state: { cake, templateId: template.id },
    });

  const validDecorationIds = new Set(
    decorations.map((d) => Number(d.id ?? d.decorationId))
  );

  const addToCart = async () => {
    if (addingToCart) return; // ignore double taps on phones

    const token = getToken();

    const customization = {
      cakeId: cakeIdNum,
      templateId: template.id,
      size: cfg.size,
      tiers: cfg.tier,
      colorId: cfg.colorDbId,
      colorHex: cfg.colorHex,
      message: cfg.message,
      font: cfg.font,
      textColor: cfg.textColor,
      sponge: cfg.flavor,
      frosting: cfg.frosting,
      candles: cfg.candles,
      lit: cfg.lit,
      decorations: (cfg.decorations || [])
        .filter((id) => validDecorationIds.has(Number(id)))
        .map((id) => ({ decorationId: Number(id), quantity: 1 })),
    };

    try {
      setAddingToCart(true);

      // Guest user
      if (!token) {
        const updatedGuestCart = addToGuestCart(
          {
            id: cakeIdNum ?? `template-${template.id}`,
            name: template.name,
            imageUrl: template.images.thumb,
            price: price.total,
          },
          1,
          { customUnitPrice: price.total, cakeTemplateId: template.id },
          customization
        );

        setCartCount(updatedGuestCart.reduce((t, i) => t + i.quantity, 0));
        setAdded(true);
        showToast(`${template.name} added to cart`, "success");
        navigate("/cart");
        return;
      }

      // Logged-in user
      const updatedCart = await cartService.addToCart(cakeIdNum, 1, null, customization);

      setCartCount(countItems(updatedCart));
      setAdded(true);
      showToast(`${template.name} added to cart`, "success");
      navigate("/cart");
    } catch (err) {
      console.error("Error adding customized cake to cart:", err);
      showToast(err.message || "Failed to add cake to cart.", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div className="cz">
      {toast && (
        <div className={`toast toast-${toast.type}`} role="status" aria-live="polite">
          {toast.message}
        </div>
      )}

      <Header
        step={2}
        cartCount={cartCount}
        leftTitle="Customize"
        rightTitle={template.name}
        variant="customize"
        onStepClick={(n) => n === 1 && changeTemplate()}
      />

      <div className="cz-body">
        <CustomizeSidebar template={template} cfg={cfg} onChangeTemplate={changeTemplate} />
        <CustomizeStage
          template={template}
          cfg={cfg}
          baseline={baseline}
          decorations={decorations}
        />
        <CustomizePanel
          template={template}
          cfg={cfg}
          onChange={update}
          price={price}
          added={added}
          onAddToCart={addToCart}
          addingToCart={addingToCart}
          decorations={decorations}
          decorationsLoading={decorationsLoading}
          decorationsError={decorationsError}
        />
      </div>
    </div>
  );
}
