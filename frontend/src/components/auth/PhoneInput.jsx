import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';


export default function CustomPhoneInput({ value, onChange }) {
  return (
    <PhoneInput
      international
      defaultCountry="US"
      value={value}
      onChange={onChange}
      className="border rounded p-2 w-full"
    />
  );
}