import { Input } from 'antd-mobile';
import { AddOutline, MinusOutline } from 'antd-mobile-icons';
import { useState } from 'react';
import './NumberInput.css';

interface NumberInputProps {
  /**
   * 输入框的值
   */
  value: string;
  /**
   * 值变化时的回调函数
   */
  onChange: (value: string) => void;
  /**
   * 输入框占位符
   */
  placeholder?: string;
  /**
   * 最小值
   */
  min?: number;
  /**
   * 最大值
   */
  max?: number;
  /**
   * 步长
   */
  step?: number;
  /**
   * 是否允许小数
   */
  allowDecimal?: boolean;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 是否禁用
   */
  disabled?: boolean;
}

/**
 * 带加减按钮的数字输入框组件
 *
 * @param {NumberInputProps} props - 组件属性
 * @returns {JSX.Element} 数字输入框组件
 */
export const NumberInput = ({
  value,
  onChange,
  placeholder = '请输入',
  min = 0,
  max = 999999,
  step = 1,
  allowDecimal = false,
  className = '',
  disabled = false,
}: NumberInputProps) => {
  // 动画状态
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationType, setAnimationType] = useState<'increase' | 'decrease' | null>(null);

  // 处理数值变化
  const handleValueChange = (newValue: string) => {
    if (newValue === '') {
      onChange('');
      return;
    }

    const regex = allowDecimal ? /^\d*\.?\d*$/ : /^\d+$/;
    if (regex.test(newValue)) {
      const num = parseFloat(newValue);
      if (!isNaN(num) && num >= min && num <= max) {
        onChange(newValue);
      }
    }
  };

  // 处理加减按钮点击
  const handleStep = (isAdd: boolean) => {
    const currentValue = value ? parseFloat(value) : 0;
    const newValue = isAdd ? currentValue + step : currentValue - step;

    if (newValue >= min && newValue <= max) {
      setIsAnimating(true);
      setAnimationType(isAdd ? 'increase' : 'decrease');

      onChange(allowDecimal ? newValue.toString() : Math.round(newValue).toString());

      window.setTimeout(() => {
        setIsAnimating(false);
        setAnimationType(null);
      }, 300);
    }
  };

  // 判断按钮是否禁用
  const isMinDisabled = value ? parseFloat(value) <= min : true;
  const isMaxDisabled = value ? parseFloat(value) >= max : false;

  // 按钮基础样式
  const buttonBaseStyle = `
    w-8 h-10
    flex items-center justify-center
    border-[var(--adm-color-primary)]
    number-input-button
    select-none
  `;

  // 按钮激活样式
  const buttonActiveStyle = ``;

  return (
    <div
      className={`
      flex items-center
      rounded-xl overflow-hidden
      border border-[var(--adm-color-primary)]
      bg-[var(--adm-color-primary-light)]
      transition-all duration-200
      hover:border-[var(--adm-color-primary-dark)]
      focus-within:ring-2 focus-within:ring-[var(--adm-color-primary)] focus-within:ring-opacity-20
      ${disabled ? 'number-input-disabled' : ''}
      ${className}
    `}
    >
      <button
        onClick={() => handleStep(false)}
        className={`
          ${buttonBaseStyle}
          border-r
          ${!isMinDisabled && buttonActiveStyle}
        `}
        disabled={isMinDisabled || disabled}
        type="button"
      >
        <MinusOutline className="text-base" />
      </button>

      <Input
        type="digit"
        pattern={allowDecimal ? '[0-9]*' : '[0-9]*'}
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={handleValueChange}
        className={`
          flex-1 h-10
          bg-transparent
          text-center text-lg font-bold
          border-0
          text-[var(--adm-color-primary)]
          px-0
          focus:ring-0
          transition-all duration-300 ease-in-out
          ${isAnimating ? 'animate-number-change' : ''}
          ${animationType === 'increase' ? 'number-increase' : ''}
          ${animationType === 'decrease' ? 'number-decrease' : ''}
          [&_input]:text-center
          [&_input]:px-0
          [&_input]:h-full
          [&_input]:leading-none
          [&_input]:flex
          [&_input]:items-center
          [&_input]:justify-center
        `}
        disabled={disabled}
      />

      <button
        onClick={() => handleStep(true)}
        className={`
          ${buttonBaseStyle}
          border-l
          ${!isMaxDisabled && buttonActiveStyle}
        `}
        disabled={isMaxDisabled || disabled}
        type="button"
      >
        <AddOutline className="text-base" />
      </button>
    </div>
  );
};
