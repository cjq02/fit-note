import { Button, Input, NavBar, TextArea } from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';
import { useEffect, useState } from 'react';

import type { CreateProjectRequest, Project } from '@/@typings/types';
import { NumberInput } from '@/components/NumberInput';
import { CATEGORY_OPTIONS } from '@/pages/project/categoryOptions';

// eslint-disable-next-line no-undef

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: CreateProjectRequest) => void;
  onCancel: () => void;
}

/**
 * 训练项目表单组件
 *
 * @param {ProjectFormProps} props - 组件属性
 * @returns {JSX.Element} 训练项目表单
 */
export const ProjectForm = ({ project, onSubmit, onCancel }: ProjectFormProps) => {
  // 项目名称
  const [name, setName] = useState('');
  // 类别
  const [category, setCategory] = useState<Project['category'] | ''>('');
  // 排序号
  const [seqNo, setSeqNo] = useState<number | ''>('');
  // 项目描述
  const [description, setDescription] = useState('');

  // 初始化/重置表单
  /**
   * 初始化或重置表单字段
   *
   * @returns {void}
   */
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setCategory(project.category || '');
      setSeqNo(project.seqNo ?? '');
      setDescription(project.description || '');
    } else {
      setName('');
      setCategory('');
      setSeqNo('');
      setDescription('');
    }
  }, [project]);

  /**
   * 提交表单
   *
   * @returns {void}
   */
  const handleSubmit = () => {
    // 校验
    if (!name) {
      // 兼容 window.toast
      (window as any).toast && (window as any).toast('请输入项目名称');
      return;
    }
    if (!category) {
      (window as any).toast && (window as any).toast('请选择类别');
      return;
    }
    if (seqNo === '' || isNaN(Number(seqNo))) {
      (window as any).toast && (window as any).toast('请输入排序号');
      return;
    }
    onSubmit({
      name,
      category: category as Project['category'],
      seqNo: Number(seqNo),
      description,
    });
  };

  /**
   * 取消并重置表单
   *
   * @returns {void}
   */
  const handleCancel = () => {
    setName('');
    setCategory('');
    setSeqNo('');
    setDescription('');
    onCancel();
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[var(--adm-color-primary-light)] to-white">
      <NavBar
        onBack={handleCancel}
        right={
          <Button fill="none" className="text-[var(--adm-color-text)]" onClick={handleCancel}>
            <CloseOutline />
          </Button>
        }
        className="bg-transparent"
      >
        {project ? '编辑训练项目' : '新增训练项目'}
      </NavBar>

      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-white/20">
            {/* 项目名称 */}
            <div className="mb-8">
              <label className="text-base font-medium text-[var(--adm-color-text)]">项目名称</label>
              <Input
                placeholder="请输入项目名称"
                className="rounded-xl bg-white border border-[var(--adm-color-text-light)] h-12 text-base px-4 focus:border-[var(--adm-color-primary)] transition-colors duration-200 [&_input]:px-0"
                value={name}
                onChange={val => setName(val)}
              />
            </div>
            {/* 类别 */}
            <div className="mb-8">
              <label className="text-base font-medium text-[var(--adm-color-text)]">类别</label>
              <select
                className="rounded-xl bg-white border border-[var(--adm-color-text-light)] h-12 text-base px-4 focus:border-[var(--adm-color-primary)] transition-colors duration-200 w-full"
                value={category}
                onChange={e => setCategory(e.target.value as Project['category'] | '')}
              >
                <option value="" disabled className="text-gray-400">
                  请选择类别
                </option>
                {CATEGORY_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            {/* 排序号 */}
            <div className="mb-8">
              <label className="text-base font-medium text-[var(--adm-color-text)]">排序</label>
              <NumberInput
                value={seqNo === '' ? '' : seqNo.toString()}
                onChange={value => setSeqNo(value ? parseInt(value) : '')}
                placeholder="请输入排序号"
                min={0}
                step={10}
                className="rounded-xl bg-white border border-[var(--adm-color-text-light)] focus:border-[var(--adm-color-primary)] transition-colors duration-200"
              />
            </div>
            {/* 项目描述 */}
            <div className="mb-8">
              <label className="text-base font-medium text-[var(--adm-color-text)]">项目描述</label>
              <TextArea
                placeholder="请输入项目描述"
                maxLength={200}
                rows={3}
                showCount
                className="rounded-xl bg-white border border-[var(--adm-color-text-light)] text-base px-4 py-3 focus:border-[var(--adm-color-primary)] transition-colors duration-200"
                value={description}
                onChange={val => setDescription(val)}
              />
            </div>
            {/* 保存按钮 */}
            <div className="mt-8">
              <Button
                block
                color="primary"
                size="large"
                onClick={handleSubmit}
                className="rounded-full h-12 text-base font-medium shadow-lg shadow-[var(--adm-color-primary)]/20 hover:shadow-xl hover:shadow-[var(--adm-color-primary)]/30 transition-all duration-300"
              >
                保存
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
