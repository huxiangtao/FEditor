import React from "react";
import { Modal, Drawer, Form, Input, Select, Button } from "antd";
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
            <Drawer
              title="新增应用"
              width={720}
              onClose={handleCancel}
              visible={modalVisible}
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
              <div className="form-btn-group">
                <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                  取消
                </Button>
                <Button
                  onClick={() => {
                    handleSubmit();
                  }}
                  type="primary"
                >
                  确定
                </Button>
              </div>
            </Drawer>
          );
        }}
      />
    );
  }
}
