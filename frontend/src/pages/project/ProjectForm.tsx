import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toast, Input, TextArea, Button } from 'antd-mobile';
import type { Project } from '@/@typings/types';
import { getProjects, createProject, updateProject } from '@/api/project.api';
import { NumberInput } from '@/components/NumberInput';
import { CATEGORY_OPTIONS } from '@/pages/project/categoryOptions';
import PageSelect from '@/components/PageSelect';
import { UNIT_OPTIONS } from '@fit-note/shared-utils';
import { EQUIPMENT_OPTIONS } from '@fit-note/shared-utils/src/index';

/**
 * 训练项目表单页面（支持新建和编辑）
 *
 * @returns {JSX.Element} 训练项目表单页面
 */
export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  // 表单字段
  const [name, setName] = useState('');
  const [equipments, setEquipments] = useState<string[]>([]); // 由字符串改为数组
  const [equipmentsInput, setEquipmentsInput] = useState(''); // 输入框内容
  const [category, setCategory] = useState<Project['category'] | ''>('');
  const [seqNo, setSeqNo] = useState<number | ''>(''); // 只存储后两位
  const [description, setDescription] = useState('');
  const [defaultUnit, setDefaultUnit] = useState<string>('自重');
  const [defaultWeight, setDefaultWeight] = useState<number | ''>('');

  // 支持从 location.state 传递 initialCategory
  const initialCategory = (location.state && (location.state as any).initialCategory) || undefined;

  // 加载项目数据（编辑时）
  useEffect(() => {
    if (id) {
      setLoading(true);
      getProjects().then(res => {
        const found = res.data.find((p: Project) => p.id === id);
        setProject(found || null);
        setLoading(false);
      });
    } else {
      setProject(null);
    }
  }, [id]);

  // 初始化/重置表单字段
  useEffect(() => {
    if (project) {
      setName(project.name || '');
      setEquipments(project.equipments || []); // 由字符串改为数组
      setEquipmentsInput((project.equipments || []).join(',')); // 初始化输入框
      setCategory(project.category || '');
      // 取后两位作为排序输入框的值
      const seqNoStr = project.seqNo?.toString().padStart(3, '0') || '';
      setSeqNo(seqNoStr ? parseInt(seqNoStr.slice(-2)) : '');
      setDescription(project.description || '');
      setDefaultUnit(project.defaultUnit || '自重');
      setDefaultWeight(project.defaultWeight ?? '');
    } else {
      setName('');
      setEquipments([]); // 由字符串改为数组
      setEquipmentsInput('');
      setCategory(initialCategory || '');
      setSeqNo('');
      setDescription('');
      setDefaultUnit('自重');
      setDefaultWeight('');
    }
  }, [project, initialCategory]);

  // 提交表单
  const handleSubmit = async () => {
    if (!name) {
      Toast.show({ content: '请输入项目名称' });
      return;
    }
    if (!category) {
      Toast.show({ content: '请选择类别' });
      return;
    }
    if (seqNo === '' || isNaN(Number(seqNo)) || Number(seqNo) < 0 || Number(seqNo) > 99) {
      Toast.show({ content: '请输入0-99的排序号' });
      return;
    }
    if (!defaultUnit) {
      Toast.show({ content: '请选择默认单位' });
      return;
    }
    // 获取类别的seqNo
    const catObj = CATEGORY_OPTIONS.find(opt => opt.value === category);
    if (!catObj) {
      Toast.show({ content: '类别无效' });
      return;
    }
    // 拼接最终seqNo：类别seqNo + 排序（两位，不足补0）
    const seqNoStr = catObj.seqNo.toString() + Number(seqNo).toString().padStart(2, '0');
    const finalSeqNo = Number(seqNoStr);
    const equipmentsArr = equipments;
    try {
      if (project) {
        await updateProject({
          name,
          equipments: equipmentsArr, // 传数组
          category: category as Project['category'],
          seqNo: finalSeqNo,
          description,
          id: project.id,
          defaultUnit: defaultUnit,
          defaultWeight: defaultWeight === '' ? undefined : Number(defaultWeight),
        });
        Toast.show({ icon: 'success', content: '更新成功' });
      } else {
        await createProject({
          name,
          equipments: equipmentsArr, // 传数组
          category: category as Project['category'],
          seqNo: finalSeqNo,
          description,
          defaultUnit: defaultUnit,
          defaultWeight: defaultWeight === '' ? undefined : Number(defaultWeight),
        });
        Toast.show({ icon: 'success', content: '创建成功' });
      }
      navigate(-1);
    } catch (error) {
      Toast.show({ icon: 'fail', content: '操作失败' });
    }
  };

  // 取消并返回
  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) return <div className="p-8 text-center text-gray-400">加载中...</div>;

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[var(--adm-color-primary-light)] to-white relative">
      <div className="flex-1 overflow-auto pb-[80px]">
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
            {/* 器械 */}
            <div className="mb-8">
              <label className="text-base font-medium text-[var(--adm-color-text)]">器械</label>
              <PageSelect
                options={EQUIPMENT_OPTIONS}
                value={equipments}
                multiple
                onChange={vals => {
                  setEquipments(vals as string[]);
                  setEquipmentsInput((vals as string[]).join(','));
                }}
                triggerRender={(selectedLabels, { onClick }) => (
                  <div
                    className={
                      'flex items-center rounded-xl bg-white border border-[var(--adm-color-text-light)] h-12 text-base px-4 focus:border-[var(--adm-color-primary)] transition-colors duration-200 w-full cursor-pointer ' +
                      (!equipments.length ? 'text-gray-400' : 'text-gray-900')
                    }
                    onClick={onClick}
                  >
                    {selectedLabels ? selectedLabels : '请选择器械'}
                  </div>
                )}
              />
            </div>
            {/* 类别 */}
            <div className="mb-8">
              <label className="text-base font-medium text-[var(--adm-color-text)]">类别</label>
              <PageSelect
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={val => setCategory(val as Project['category'])}
                triggerRender={(selectedLabel, { onClick }) => (
                  <div
                    className={
                      'flex items-center rounded-xl bg-white border border-[var(--adm-color-text-light)] h-12 text-base px-4 focus:border-[var(--adm-color-primary)] transition-colors duration-200 w-full cursor-pointer ' +
                      (!category ? 'text-gray-400' : 'text-gray-900')
                    }
                    onClick={onClick}
                  >
                    {selectedLabel || '请选择类别'}
                  </div>
                )}
              />
            </div>
            {/* 默认单位 */}
            <div className="mb-8">
              <label className="text-base font-medium text-[var(--adm-color-text)]">默认单位</label>
              <PageSelect
                options={UNIT_OPTIONS}
                value={defaultUnit}
                onChange={val => setDefaultUnit(val as string)}
                triggerRender={(selectedLabel, { onClick }) => (
                  <div
                    className={
                      'flex items-center rounded-xl bg-white border border-[var(--adm-color-text-light)] h-12 text-base px-4 focus:border-[var(--adm-color-primary)] transition-colors duration-200 w-full cursor-pointer ' +
                      (!defaultUnit ? 'text-gray-400' : 'text-gray-900')
                    }
                    onClick={onClick}
                  >
                    {selectedLabel || '请选择单位'}
                  </div>
                )}
              />
            </div>
            {/* 默认重量 */}
            <div className="mb-8">
              <label className="text-base font-medium text-[var(--adm-color-text)]">默认重量</label>
              <NumberInput
                value={defaultWeight === '' ? '' : defaultWeight.toString()}
                onChange={value => {
                  let v: number | '' = value ? parseFloat(value) : '';
                  if (typeof v === 'number' && isNaN(v)) v = '';
                  setDefaultWeight(v);
                }}
                placeholder="请输入默认重量"
                min={0}
                max={1000}
                step={1}
                className="rounded-xl bg-white border border-[var(--adm-color-text-light)] focus:border-[var(--adm-color-primary)] transition-colors duration-200"
                disabled={defaultUnit === '自重'}
              />
            </div>
            {/* 排序号 */}
            <div className="mb-8">
              <label className="text-base font-medium text-[var(--adm-color-text)]">排序</label>
              <NumberInput
                value={seqNo === '' ? '' : seqNo.toString().padStart(2, '0')}
                onChange={value => {
                  let v: number | '' = value ? parseInt(value) : '';
                  if (typeof v === 'number') {
                    if (v > 99) v = 99;
                    if (v < 0) v = 0;
                  }
                  setSeqNo(v);
                }}
                placeholder="请输入排序号"
                min={0}
                max={99}
                step={1}
                className="rounded-xl bg-white border border-[var(--adm-color-text-light)] focus:border-[var(--adm-color-primary)] transition-colors duration-200"
              />
            </div>
            {/* 项目描述 */}
            <div className="mb-8">
              <label className="text-base font-medium text-[var(--adm-color-text)]">项目描述</label>
              <TextArea
                placeholder="请输入项目描述"
                maxLength={200}
                rows={5}
                showCount
                className="rounded-xl bg-white border border-[var(--adm-color-text-light)] text-base px-4 py-3 focus:border-[var(--adm-color-primary)] transition-colors duration-200"
                value={description}
                onChange={val => setDescription(val)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* 固定底部按钮栏 */}
      <div className="fixed left-0 right-0 bottom-0 z-10 bg-white/90 backdrop-blur-md border-t border-white/30 px-4 py-2 flex gap-4 h-[60px] items-center justify-center">
        <Button
          block
          color="primary"
          size="large"
          onClick={handleSubmit}
          className="rounded-full h-12 text-base font-medium shadow-lg shadow-[var(--adm-color-primary)]/20 hover:shadow-xl hover:shadow-[var(--adm-color-primary)]/30 transition-all duration-300"
        >
          保存
        </Button>
        <Button
          block
          color="default"
          size="large"
          onClick={handleCancel}
          className="rounded-full h-12 text-base font-medium"
        >
          取消
        </Button>
      </div>
    </div>
  );
}
