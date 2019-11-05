import React from "react";
import { Modal, Form, Input, Select } from "antd";
import { Form as FinalForm, Field } from "react-final-form";
import { randomString } from "../utils";

const { Option } = Select;
interface CreateAppProps {
  modalVisible: boolean;
  handleCancel: () => void;
  createApp: (app: any) => void;
}

export default class CreateApp extends React.Component<CreateAppProps, any> {
  onSubmit = (values: any) => {
    const { createApp } = this.props;

    if (!values.name || !values.apptype) {
      return;
    }
    createApp({
      id: randomString(12),
      type: values.apptype,
      name: values.name
    });
  };

  validate = (values: any) => {
    const errors = {};
    if (!values.name) {
      (errors as any)["name"] = "app name require";
    }
    if (!values.apptype) {
      (errors as any)["apptype"] = "apptype require";
    }
    return errors;
  };

  render() {
    const { modalVisible, handleCancel } = this.props;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 18 }
    };
    return (
      <FinalForm
        onSubmit={this.onSubmit}
        validate={this.validate}
        render={({ handleSubmit }) => {
          return (
            <Modal
              title="新增应用" // 镜像清理
              visible={modalVisible}
              destroyOnClose={true}
              width={500}
              onOk={() => {
                handleSubmit();
              }}
              onCancel={handleCancel}
            >
              <form onSubmit={handleSubmit}>
                <Form {...formItemLayout} colon={false}>
                  <Field
                    name="name"
                    render={({ input, meta }) => {
                      const { error, touched } = meta;
                      const { onChange, value } = input;
                      return (
                        <Form.Item
                          required
                          help={touched && error}
                          validateStatus={touched && error ? "error" : ""}
                          label="应用名称"
                        >
                          <Input onChange={onChange} checked={value} />
                        </Form.Item>
                      );
                    }}
                  />
                  <Field
                    name="apptype"
                    render={({ input, meta }) => {
                      const { onChange, value } = input;
                      const { error, touched } = meta;
                      return (
                        <Form.Item
                          required
                          help={touched && error}
                          validateStatus={touched && error ? "error" : ""}
                          label="应用类型"
                        >
                          <Select
                            defaultValue="task"
                            value={value}
                            style={{ width: 120 }}
                            onChange={onChange}
                          >
                            <Option value="task">普通应用</Option>
                            <Option value="human">人工参与应用</Option>
                          </Select>
                        </Form.Item>
                      );
                    }}
                  />
                </Form>
              </form>
            </Modal>
          );
        }}
      />
    );
  }
}
