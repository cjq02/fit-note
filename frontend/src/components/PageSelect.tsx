import React, { useRef } from 'react';
import { Popup, List, Checkbox, Radio, SpinLoading } from 'antd-mobile';
import type { FC } from 'react';

/**
 * PageSelect 组件属性
 *
 * @property {boolean} visible 是否显示弹窗（已废弃，自动管理）
 * @property {() => void} onClose 关闭弹窗回调（已废弃，自动管理）
 * @property {{ label: string; value: string }[]} options 选项列表
 * @property {string | string[]} value 当前选中值（单选为 string，多选为 string[]）
 * @property {(val: string | string[]) => void} onChange 选中变化回调
 * @property {boolean} [multiple] 是否多选，默认为 false
 * @property {boolean} [loading] 是否正在加载更多
 * @property {boolean} [hasMore] 是否还有更多数据
 * @property {() => void} [onLoadMore] 加载更多回调
 * @property {(selectedLabel: string, extra: { onClick: () => void }) => React.ReactNode} [triggerRender] 自定义触发区渲染，extra.onClick 必须绑定到触发区
 */
export interface PageSelectProps {
  options: { label: string; value: string }[];
  value: string | string[];
  onChange: (val: string | string[]) => void;
  multiple?: boolean;
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  triggerRender?: (selectedLabel: string, extra: { onClick: () => void }) => React.ReactNode;
}

/**
 * 底部弹出的选择组件，支持单选/多选，下滑加载更多，内置触发区
 *
 * @param {PageSelectProps} props 组件属性
 * @returns {JSX.Element} PageSelect 组件
 */
const PageSelect: FC<PageSelectProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  loading = false,
  hasMore = false,
  onLoadMore,
  triggerRender,
}) => {
  const listRef = useRef<any>(null);
  const [visible, setVisible] = React.useState(false);

  // 当前选中项label
  const selectedLabel = React.useMemo(() => {
    if (multiple) {
      if (Array.isArray(value)) {
        return options
          .filter(opt => value.includes(opt.value))
          .map(opt => opt.label)
          .join(', ');
      }
      return '';
    } else {
      const found = options.find(opt => opt.value === value);
      return found ? found.label : '';
    }
  }, [options, value, multiple]);

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
      setVisible(false);
    }
  };

  // 触发区
  const trigger = triggerRender ? (
    triggerRender(selectedLabel, { onClick: () => setVisible(true) })
  ) : (
    <div
      className="mb-2 h-[40px] leading-[40px] px-3 rounded-lg border border-solid border-[var(--adm-color-border)] bg-white active:bg-[var(--adm-color-fill-light)] transition-colors cursor-pointer flex items-center justify-between"
      onClick={() => setVisible(true)}
    >
      <span>{selectedLabel || '请选择'}</span>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ marginLeft: 8 }}
      >
        <path
          d="M5 8L10 13L15 8"
          stroke="var(--adm-color-primary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );

  return (
    <>
      {trigger}
      <Popup
        visible={visible}
        onMaskClick={() => setVisible(false)}
        onClose={() => setVisible(false)}
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
    </>
  );
};

export default PageSelect;
