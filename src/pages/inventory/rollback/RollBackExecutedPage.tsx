import React, {useEffect, useState} from "react";

import {message, Modal} from "antd";
import {EditableProTable, ProColumns} from "@ant-design/pro-components";
import {InventoryRollbackGoodDetail} from "@/pages/inventory/rollback/type";
import RollbackService from "@/pages/inventory/rollback/RollbackService";

interface Props {
  open: boolean;
  code:string
  id:number
  close: () => void;
  reload: () => void;
}

const RollbackExecutedPage: React.FC<Props> = (props: Props) => {
  const [data, setData] = useState<readonly InventoryRollbackGoodDetail[]>([]);
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(
    []
  );

  const mutableData: InventoryRollbackGoodDetail[] = data as InventoryRollbackGoodDetail[];


  useEffect(() => {
    RollbackService.getGoods(props.id).then((data) =>{
      let inventoryGoods:InventoryRollbackGoodDetail[] = data.map(item => ({
        ...item, // 拷贝原对象的其它属性
        toExecuteAmount: item.amount - item.executedAmount // 修改 toExecuteAmount 属性值
      }));
      setData(inventoryGoods);
      setEditableRowKeys( data.map((item) => item.id));
    } );
  }, [props.id]);

  const handleSave = async () => {
    try {
      const res: any = await RollbackService.execute(props.id,mutableData);
      message.success('添加成功');
      if (props.reload) {
        props.reload();
      }
      props.close();
      if ((window as any).onTabSaveSuccess) {
        (window as any).onTabSaveSuccess(res);
        setTimeout(() => window.close(), 300);
      }
    } catch (ex) {

    }
  };


  const columns: ProColumns<InventoryRollbackGoodDetail>[] = [
    {
      title: '物资名称',
      dataIndex: 'goodName',
      valueType: 'text',
      editable:false
    },
    {
      title: '物资编码',
      dataIndex: 'goodCode',
      valueType: 'text',
      editable:false
    },
    {
      title: '入库数',
      dataIndex: 'amount',
      valueType: 'text',
      editable:false
    },
    {
      title: '已执行数',
      dataIndex: 'executedAmount',
      valueType: 'text',
      editable:false
    },
    {
      title: '可执行数',
      valueType: 'text',
      render: (_, record) =>
        `${record.amount - record.executedAmount}`,
      editable:false
    },
    {
      title: '本次执行数量',
      dataIndex: 'toExecuteAmount',
      formItemProps: () => {
        return {
          rules: [{ required: true, message: '此项为必填项' },
            {type:"number",message:'请输入数字'},
            {
              min: 0,
              type: 'number',
              message: '值必须大于或等于0',
            },],
        };
      },
    }
  ];

  return (
    <Modal
      title={props.code}
      centered
      open={props.open}
      onOk={handleSave}
      onCancel={props.close}
      width={1200}
    >
      <EditableProTable<InventoryRollbackGoodDetail>
        columns={columns}
        controlled={true}
        rowKey="id"
        scroll={{ x: 960 }}
        value={data}
        onChange={setData}
        recordCreatorProps={false}
        editable={{
          type: 'multiple',
          editableKeys,
          onChange: setEditableRowKeys,
        }}
      />
    </Modal>
  );
};

export default RollbackExecutedPage
