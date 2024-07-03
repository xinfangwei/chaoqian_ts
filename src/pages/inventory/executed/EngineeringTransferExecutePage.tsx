import React, { useRef, useState} from "react";
import {
  ActionType,
  type ProColumns,

  ProTable,
  PageContainer
} from "@ant-design/pro-components";
import {Button, Select} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import DeleteButton from "@/components/DelectButton";
import {
  InventoryEngineeringTransfersQueryParam,
  InventoryEngineeringTransferListDto,
  getInventoryEngineeringTransferStatusColor,
  getInventoryEngineeringTransferStatusDescription,
  InventoryEngineeringTransferStatus
} from "@/pages/inventory/engineering-transfer/type"
import OrganizeTreeSelect from "@/pages/organize-manage/organize/OrganizeTreeSelect";
import HouseSelect from "@/pages/inventory/purchase-request/HouseSelect";
import EngineeringTransferService from "@/pages/inventory/engineering-transfer/EngineeringTransferService";
import {toStringOfDay} from "@/components/Extension/DateTime";
import EngineeringTransferExecutedPage from "@/pages/inventory/engineering-transfer/EngineeringTransferExecutedPage";


const EngineeringTransferExecutePage: React.FC = () => {
  const [current, setCurrent] = useState<InventoryEngineeringTransferListDto>();
  const [open, setOpen] = useState<boolean>(false);
  const [openExecuted, setOpenExecuted] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();

  const columns: ProColumns<InventoryEngineeringTransferListDto>[] = [

    {
      title: '关键字',
      dataIndex: 'keyword',
      valueType: 'textarea',
      hideInTable: true,
    },
    {
      title: '部门',
      dataIndex: 'organizeIds',
      valueType: 'treeSelect',
      hideInTable: true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      renderFormItem: (_, { defaultRender, ...rest }, form) => (
        <OrganizeTreeSelect
          {...rest}
          style={{ width: 300 }}
          value={form.getFieldValue(_.dataIndex)}
          onChange={(value) => form.setFieldValue(_.dataIndex, value)}
          multiple
        />
      ),
    },
    {
      title: '相关仓库',
      dataIndex: 'inventoryHouseIds',
      valueType: 'select',
      hideInTable:true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      renderFormItem: (_, { defaultRender, ...rest }, form) => (
        <HouseSelect
          {...rest}
          onChange={(value) => form.setFieldValue(_.dataIndex, value)}
        />
      ),
    },
    {
      title: '录入时间',
      dataIndex: 'createTime',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => ({
          startCreateTime: value[0],
          endCreateTime: value[1],
        }),
      },
    },
    {
      title: '执行时间',
      dataIndex: 'ExecutedTime',
      valueType: 'dateRange',
      hideInTable: true,
      search: {
        transform: (value) => ({
          startExecutedTime: value[0],
          endExecutedTime: value[1],
        }),
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      hideInTable:true,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      renderFormItem: (_, { defaultRender, ...rest }, form) => (
        <Select
          mode="multiple"
          style={{ width: '100%' }}
          {...rest}
          onChange={(value) => form.setFieldValue(_.dataIndex, value)}
          options={
            [{
              value: InventoryEngineeringTransferStatus.auditing,
              label: '审核中',
            },
              {
                value: InventoryEngineeringTransferStatus.unExecuted,
                label: '未执行',
              },{
              value: InventoryEngineeringTransferStatus.executing,
              label: '执行中',
            },{
              value:InventoryEngineeringTransferStatus.executed,
              label:'已执行'
            }]
          }
        />
      ),
    },

    {
      title: '单据编号',
      dataIndex: 'code',
      valueType: 'textarea',
      search: false,
      width:150,
    },
    {

      title: '状态',
      search:false,
      width:70,
      render: (text, record) => {
        return (
          <div style={{ backgroundColor: getInventoryEngineeringTransferStatusColor(record.status,false), color: getInventoryEngineeringTransferStatusColor(record.status,true),  padding:'5px'}}>
            {getInventoryEngineeringTransferStatusDescription(record.status)}
          </div>
        );
      }
    },
    {

      title: '仓库',
      dataIndex: 'inventoryHouseName',
      search:false,
      width:100,
    },
    {

      title: '录入部门',
      dataIndex: 'organizeName',
      search:false,
      width:100,
    },

    {

      title: '流程名称',
      dataIndex: 'workflowDefinitionName',
      search:false,
      width:100,
    },
    {

      title: '当前步骤',
      search:false,
      width:130,
      render: (_, record) =>
        (record.workflowInstanceStatus?.length === 0&&record.todoHandleUsersName?.length === 0)?'':`${record.workflowInstanceStatus}(${record.todoHandleUsersName})`
    },
    {
      title: '调出工程',
      dataIndex: 'inventoryOutEngineeringName',
      search:false,
      width:250,
    },
    {
      title: '调入工程',
      dataIndex: 'inventoryInEngineeringName',
      search:false,
      width:250,
    },
    {
      title: '录入人',
      dataIndex: 'createByName',
      search:false,
      width:100,
    },
    {
      title: '录入日期',
      valueType:'date',
      dataIndex: 'createTime',
      search:false,
      width:100,
    },
    {
      title: '执行人',
      dataIndex: 'executedUserName',
      search:false,
      width:100,
    },
    {
      title: '执行时间',
      valueType:'date',
      search:false,
      width:100,
      render:(_,record) => {
        if(getInventoryEngineeringTransferStatusDescription(record.status)==='已完成' || getInventoryEngineeringTransferStatusDescription(record.status)==='执行中' ||
          getInventoryEngineeringTransferStatusDescription(record.status)==='被退回'
        ){
          return toStringOfDay(record.executedTime!);
        }else {
          return  '';
        }

      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
      search:false
    },
    {

      title: '操作',
      valueType: 'option',
      width: 200,
      fixed: 'right',
      render: (_, record) => [
        <Button
          type={'link'}
          onClick={() => {
            setCurrent(record);
            setOpen(true);
          }}
          key="view"
          style={{padding: 0}}
        >
          详情
        </Button>,
        <Button
          type={'link'}
          onClick={() => {
            setCurrent(record);
            setOpenExecuted(true);
          }}
          key="execute"
          style={{ padding: 0 }}
        >
          执行
        </Button>
        ,
        record.status === InventoryEngineeringTransferStatus.unExecuted?<DeleteButton
          key="delete"
          onDelete={
            async () => {
              await EngineeringTransferService.delete(record.id!);
              actionRef.current?.reload();
            }
          }
        >
        </DeleteButton>:null,
      ],
    },
  ];

  // 自定义表格头部标题，包含多个按钮
  return  <PageContainer pageHeaderRender={false}>
    <ProTable<InventoryEngineeringTransferListDto, InventoryEngineeringTransfersQueryParam>
      actionRef={actionRef}
      pagination={{ pageSize: 10 }}
      scroll={{ x: 1500,  }}

      rowKey="id"
      search={{
        labelWidth: 120,
      }}

      request={async (params) => {
        params.status = [InventoryEngineeringTransferStatus.unExecuted,InventoryEngineeringTransferStatus.executing];
        return await EngineeringTransferService.list(params);
      }}
      columns={columns}

    />
    {openExecuted &&  <EngineeringTransferExecutedPage close={ ()=>{
      setOpenExecuted(false)
    }} code={current!.code!} id={current!.id} open={openExecuted}

                                      reload={()=>{
                                        actionRef.current?.reload();
                                      }}></EngineeringTransferExecutedPage>}
    {/*{open &&  <PrePurchaseRequestSavePage  onClose={ ()=>{*/}
    {/*  setOpen(false);*/}
    {/*  setCurrent(undefined);*/}
    {/*}}  data={current} open={open}   title={"新增"}></PrePurchaseRequestSavePage>}*/}


  </PageContainer>;
}




export default EngineeringTransferExecutePage;
