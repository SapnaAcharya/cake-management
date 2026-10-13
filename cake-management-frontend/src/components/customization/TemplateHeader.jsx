import Navbar from "../Navbar";               // keep your existing path
import StepIndicator from "./StepIndicator.jsx";
import "../../styles/template.css";

export default function Header({ step, cartCount, leftTitle, rightTitle, variant }) {
  return (
    <>
      <Navbar cartCount={cartCount} />
      <div className={`steps-bar ${variant ? `steps-bar--${variant}` : ""}`}>
        <h1 className="steps-bar__title steps-bar__title--left">{leftTitle}</h1>
        <div className="steps-bar__steps">
          <StepIndicator current={step} />
        </div>
        <h2 className="steps-bar__title steps-bar__title--right">{rightTitle}</h2>
      </div>
    </>
  );
}