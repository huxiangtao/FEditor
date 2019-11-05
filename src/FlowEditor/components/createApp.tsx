import React from "react";
import { Modal, Form, Input } from "antd";
import { Form as FinalForm, Field } from "react-final-form";

interface CreateAppProps {
  modalVisible: boolean;
  handleCancel: () => void;
  createApp: (app: any) => void;
}

export default class CreateApp extends React.Component<CreateAppProps, any> {
  renderLabel = (text: string) => {
    const style = { color: "#666", marginRight: "30px" };
    return <div style={style}>{text}</div>;
  };
  onSubmit = (values: any) => {
    const { createApp } = this.props;
    createApp({ id: values.name, type: "common", name: values.name });
  };
  render() {
    const { modalVisible, handleCancel } = this.props;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 }
    };
    return (
      <FinalForm
        onSubmit={this.onSubmit}
        render={({ handleSubmit }) => {
          return (
            <Modal
              title="新增应用" // 镜像清理
              visible={modalVisible}
              destroyOnClose={true}
              width={400}
              onOk={() => {
                handleSubmit();
              }}
              onCancel={handleCancel}
            >
              <form onSubmit={handleSubmit}>
                <Form {...formItemLayout} colon={false}>
                  <Field
                    name="name"
                    render={({ input }) => {
                      const { onChange, value } = input;
                      return (
                        <Form.Item label={this.renderLabel("应用名称")}>
                          <Input onChange={onChange} checked={value} />
                        </Form.Item>
                      );
                    }}
                  />
                  <Field
                    name="config"
                    render={({ input }) => {
                      const { onChange, value } = input;
                      return (
                        <Form.Item label={this.renderLabel("应用配置")}>
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
