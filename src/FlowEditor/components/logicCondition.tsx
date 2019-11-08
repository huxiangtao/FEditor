import React from "react";
import { Modal, Form, Input, Select, Button } from "antd";
import { Form as FinalForm, Field } from "react-final-form";

const { Option } = Select;
interface LogicConditionProps {
  modalVisible: boolean;
  handleCancel: () => void;
  handleOk: () => void;
}

export default class LogicCondition extends React.Component<
  LogicConditionProps,
  any
> {
  onSubmit = (values: any) => {
    if (!values.name || !values.apptype) {
      return;
    }
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
    const { modalVisible, handleCancel, handleOk } = this.props;
    return (
      <FinalForm
        onSubmit={this.onSubmit}
        validate={this.validate}
        render={({ handleSubmit }) => {
          return (
            <Modal
              title="编辑逻辑判断"
              width={560}
              visible={modalVisible}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              <form onSubmit={handleSubmit}>
                <Form layout="inline">
                  <Field
                    name="key"
                    render={({ input, meta }) => {
                      const { error, touched } = meta;
                      const { onChange, value } = input;
                      return (
                        <Form.Item
                          required
                          help={touched && error}
                          validateStatus={touched && error ? "error" : ""}
                          label="键名"
                        >
                          <Input onChange={onChange} checked={value} />
                        </Form.Item>
                      );
                    }}
                  />
                  <Field
                    name="value"
                    render={({ input, meta }) => {
                      const { error, touched } = meta;
                      const { onChange, value } = input;
                      return (
                        <Form.Item
                          required
                          help={touched && error}
                          validateStatus={touched && error ? "error" : ""}
                          label="值"
                        >
                          <Input onChange={onChange} checked={value} />
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
