import React from 'react';
import { SpinLoading } from 'antd-mobile';

/**
 * 加载遮罩组件属性
 */
interface LoadingOverlayProps {
  /** 是否显示加载遮罩 */
  visible: boolean;
  /** 自定义加载文本 */
  text?: string;
  /** 遮罩背景透明度，默认0.9 */
  opacity?: number;
  /** 自定义样式 */
  style?: React.CSSProperties;
  /** 自定义类名 */
  className?: string;
  /** 子组件 */
  children?: React.ReactNode;
}

/**
 * 加载遮罩组件
 *
 * 用于在数据加载期间显示全屏遮罩，防止用户交互
 *
 * @param {LoadingOverlayProps} props 组件属性
 * @returns {JSX.Element} 加载遮罩组件
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text,
  opacity = 0.9,
  style,
  className,
  children,
}) => {
  if (!visible) {
    return <>{children}</>;
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...style,
      }}
    >
      {children}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `rgba(255, 255, 255, ${opacity})`,
          zIndex: 1000,
        }}
      >
        <SpinLoading />
        {text && (
          <div
            style={{
              marginTop: 12,
              fontSize: 14,
              color: '#666',
              textAlign: 'center',
            }}
          >
            {text}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
