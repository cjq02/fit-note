import React, { useRef } from 'react';
import { Popup, List, Checkbox, Radio, SpinLoading } from 'antd-mobile';
import type { FC } from 'react';

/**
 * PageSelect 组件属性
 *
 * @property {boolean} visible 是否显示弹窗
 * @property {() => void} onClose 关闭弹窗回调
 * @property {{ label: string; value: string }[]} options 选项列表
 * @property {string | string[]} value 当前选中值（单选为 string，多选为 string[]）
 * @property {(val: string | string[]) => void} onChange 选中变化回调
 * @property {boolean} [multiple] 是否多选，默认为 false
 * @property {boolean} [loading] 是否正在加载更多
 * @property {boolean} [hasMore] 是否还有更多数据
 * @property {() => void} [onLoadMore] 加载更多回调
 */
export interface PageSelectProps {
  visible: boolean;
  onClose: () => void;
  options: { label: string; value: string }[];
  value: string | string[];
  onChange: (val: string | string[]) => void;
  multiple?: boolean;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

/**
 * 底部弹出的选择组件，支持单选/多选，下滑加载更多
 *
 * @param {PageSelectProps} props 组件属性
 * @returns {JSX.Element} PageSelect 组件
 */
const PageSelect: FC<PageSelectProps> = ({
  visible,
  onClose,
  options,
  value,
  onChange,
  multiple = false,
  loading = false,
  hasMore = false,
  onLoadMore,
}) => {
  const listRef = useRef<any>(null);

  // 滚动到底部加载更多
  const handleScroll = () => {
    if (!onLoadMore || loading || !hasMore) return;
    const el = listRef.current;
    if (el && el.scrollHeight - el.scrollTop - el.clientHeight < 32) {
      onLoadMore();
    }
  };

  // 选中项变化
  const handleSelect = (val: string) => {
    if (multiple) {
      const arr = Array.isArray(value) ? value.slice() : [];
      const idx = arr.indexOf(val);
      if (idx > -1) {
        arr.splice(idx, 1);
      } else {
        arr.push(val);
      }
      onChange(arr);
    } else {
      onChange(val);
      onClose();
    }
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      onClose={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        minHeight: 320,
        maxHeight: '60vh',
        padding: 0,
      }}
    >
      <div
        ref={listRef}
        style={{ maxHeight: '60vh', overflowY: 'auto', padding: 16 }}
        onScroll={handleScroll}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {options.map(opt => {
            const checked = multiple
              ? Array.isArray(value) && value.includes(opt.value)
              : value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '100%',
                  height: 56,
                  borderRadius: 16,
                  border: checked ? '2px solid var(--adm-color-primary)' : '1.5px solid #e5e6eb',
                  background: checked ? 'var(--adm-color-primary-light)' : '#fff',
                  color: checked ? 'var(--adm-color-primary)' : '#222',
                  fontWeight: checked ? 700 : 500,
                  fontSize: 17,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none',
                  boxShadow: checked
                    ? '0 4px 16px 0 rgba(0,0,0,0.08)'
                    : '0 2px 8px 0 rgba(0,0,0,0.03)',
                  margin: '0 0 4px 0',
                  padding: 0,
                  letterSpacing: 1,
                }}
              >
                {opt.label}
                {multiple && (
                  <span style={{ marginLeft: 8, fontSize: 14 }}>
                    <Checkbox checked={checked} style={{ pointerEvents: 'none' }} />
                  </span>
                )}
                {!multiple && checked && (
                  <span style={{ marginLeft: 8, fontSize: 14 }}>
                    <Radio checked style={{ pointerEvents: 'none' }} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div style={{ textAlign: 'center', padding: 12, color: '#999', fontSize: 14 }}>
          {loading ? <SpinLoading /> : hasMore ? '下拉加载更多...' : '没有更多了'}
        </div>
      </div>
    </Popup>
  );
};

export default PageSelect;
