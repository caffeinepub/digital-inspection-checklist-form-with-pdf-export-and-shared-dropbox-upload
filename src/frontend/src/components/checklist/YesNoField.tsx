import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface YesNoFieldProps {
  label: string;
  value: 'yes' | 'no' | '';
  onChange: (value: 'yes' | 'no' | '') => void;
}

export default function YesNoField({ label, value, onChange }: YesNoFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onChange(val as 'yes' | 'no' | '')}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id={`${label}-yes`} />
          <Label htmlFor={`${label}-yes`} className="font-normal cursor-pointer">
            Yes
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id={`${label}-no`} />
          <Label htmlFor={`${label}-no`} className="font-normal cursor-pointer">
            No
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
