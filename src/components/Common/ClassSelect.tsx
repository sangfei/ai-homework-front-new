import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useClassSelectOptions } from '../../hooks/useClasses';

interface ClassSelectProps {
  value?: number | string;
  onChange: (value: number | string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowEmpty?: boolean;
  emptyLabel?: string;
}

const ClassSelect: React.FC<ClassSelectProps> = ({
  value,
  onChange,
  placeholder = "请选择班级",
  className = "",
  disabled = false,
  allowEmpty = true,
  emptyLabel = "全部班级"
}) => {
  const { selectOptions, loading, error } = useClassSelectOptions();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    onChange(selectedValue === '' ? '' : Number(selectedValue));
  };

  if (error) {
    return (
      <div className="relative">
        <select
          disabled
          className={`w-full px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600 ${className}`}
        >
          <option>加载班级失败</option>
        </select>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || loading}
        className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white ${
          loading ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        {allowEmpty && (
          <option value="">{loading ? '加载中...' : emptyLabel}</option>
        )}
        {!loading && selectOptions.length === 0 && !allowEmpty && (
          <option value="" disabled>{placeholder}</option>
        )}
        {selectOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      {loading && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default ClassSelect;