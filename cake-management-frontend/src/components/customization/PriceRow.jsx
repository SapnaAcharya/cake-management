import { Truck } from "lucide-react";
import "../../styles/template.css";

export default function PriceRow({ price }) {
  return (
    <section>
      <h3 className="section-title">Price Starting From</h3>
      <div className="price">
        <strong className="price__amount">Rs. {price.toLocaleString("en-US")}</strong>
        <div className="price__delivery">
          <Truck size={22} strokeWidth={1.6} />
          <div>
            <span className="price__delivery-title">Free Delivery</span>
            <span className="price__delivery-sub">On orders above Rs. 3,000</span>
          </div>
        </div>
      </div>
    </section>
  );
}
