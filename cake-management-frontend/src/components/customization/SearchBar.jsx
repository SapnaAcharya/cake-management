import { Search } from "lucide-react";
import "../../styles/template.css";

export default function SearchBar({ value, onChange }) {
  return (
    <label className="search">
      <Search size={17} strokeWidth={1.8} />
      <input
        type="search"
        placeholder="Search templates..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search templates"
      />
    </label>
  );
}
