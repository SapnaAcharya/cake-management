import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CustomizeHeader from "./Customizeheader";
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

const TEMPLATE_PAGE = "/templates";

export default function CustomizePage() {
  const { cakeId, templateId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    templateService
      .getTemplateById(templateId)
      .then((data) => {
        if (!isMounted) return;
        setTemplate(mapApiTemplateToViewModel(data));
        console.log("includes:", mapApiTemplateToViewModel(data).includes);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [templateId]);

  if (loading) {
    return <div className="cz-loading">Loading template...</div>;
  }

  if (error || !template) {
    navigate(TEMPLATE_PAGE, { replace: true });
    return null;
  }

  // key = template.id, so the form resets if the id in the URL ever changes
  return <Customizer key={template.id} template={template} cakeId={cakeId} initialColorId={state?.colorId} />;
}

function Customizer({ template, cakeId, initialColorId }) {
  const navigate = useNavigate();

  const [baseline] = useState(() => initialConfig(template, initialColorId));
  const [cfg, setCfg] = useState(baseline);

  console.log("baseline.decorations:", baseline.decorations);
  console.log("cfg.decorations:", cfg.decorations);

  const [added, setAdded] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const [decorations, setDecorations] = useState([]);
  const [decorationsLoading, setDecorationsLoading] = useState(true);
  const [decorationsError, setDecorationsError] = useState("");

  useEffect(() => {
    let ignore = false;

    const loadDecorations = async () => {
      setDecorationsLoading(true);
      setDecorationsError("");
      try {
        const data = await decorationService.getDecorations();
        if (!ignore) setDecorations(data.items || data || []);
      } catch (err) {
        if (!ignore) setDecorationsError(err.message || "Failed to load decorations.");
      } finally {
        if (!ignore) setDecorationsLoading(false);
      }
    };

    loadDecorations();
    return () => { ignore = true; };
  }, []);

  // Load existing cart count on mount (mirrors Home.jsx)
  useEffect(() => {
    const loadInitialCartCount = async () => {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");

      if (!token) {
        setCartCount(getGuestCartCount());
        return;
      }

      try {
        const cart = await cartService.getCart();
        const count = cart.items.reduce((total, item) => total + item.quantity, 0);
        setCartCount(count);
      } catch {
        console.error("Failed to load customer cart:");
      }
    };

    loadInitialCartCount();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const update = (patch) => {
    setAdded(false);
    setCfg((current) => ({ ...current, ...patch }));
  };

  const price = useMemo(() => calcPrice(template, cfg), [template, cfg]);

  const changeTemplate = () =>
    navigate(TEMPLATE_PAGE, { state: { templateId: template.id } });

  const validDecorationIds = new Set(
    decorations.map((decoration) => Number(decoration.id ?? decoration.decorationId))
  );

const addToCart = async () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  console.log("cfg.colorId =", cfg.colorId);
  console.log("cfg.decorations =", cfg.decorations);
  console.log("decorations =", decorations);
  
  // Built once, used by both guest and logged-in users
  const customization = {
    cakeId: Number(cakeId),
    templateId: template.id,
    size: cfg.size,
    tiers: cfg.tier,
    colorId: cfg.colorDbId,
    colorHex: cfg.colorHex,
    message: cfg.message,
    font: cfg.font,
    sponge: cfg.flavor,
    frosting: cfg.frosting,
    candles: cfg.candles,
    lit: cfg.lit,
    decorations: cfg.decorations
      .filter((id) => validDecorationIds.has(id))
      .map((id) => ({ decorationId: Number(id), quantity: 1 })),
  };

  try {
    setAddingToCart(true);

    // Guest user
    if (!token) {
      const updatedGuestCart = addToGuestCart(
        {
          id: Number(cakeId), // real cake id, NOT template.id
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
    const updatedCart = await cartService.addToCart(Number(cakeId), 1, null, customization);

    setCartCount(updatedCart.items.reduce((t, i) => t + i.quantity, 0));
    setAdded(true);
    showToast(`${template.name} added to cart`, "success");
    navigate("/cart");
  } catch (err) {
    console.error("Error adding customized cake to cart:", err);
    showToast(err.message || "Failed to add cake to cart.");
  } finally {
    setAddingToCart(false);
  }
};

  return (
    <div className="cz">
       {toast && (
        <div className={`toast toast-${toast.type}`} role="status">
          {toast.message}
        </div>
      )}
      <CustomizeHeader
        current={2}
        cartCount={cartCount}
        onStepClick={(step) => step === 1 && changeTemplate()}
      />

      <div className="cz-body">
        <CustomizeSidebar template={template} cfg={cfg} onChangeTemplate={changeTemplate} />
        <CustomizeStage template={template} cfg={cfg} baseline={baseline} decorations={decorations} />
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