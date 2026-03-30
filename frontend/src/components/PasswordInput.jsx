import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const PasswordInput = ({ label = "Password", value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-control mb-4">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>

      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password..."
          className="input input-bordered w-full pr-12"
          value={value}
          onChange={onChange}
        />

        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
