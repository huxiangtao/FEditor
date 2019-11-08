import React, { Fragment } from "react";
import { Steps, Drawer, Form, Input, Select, Button, Icon, Radio } from "antd";
import { Form as FinalForm, Field } from "react-final-form";
import { randomString } from "../utils";

const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 }
};
interface CreateAppProps {
  modalVisible: boolean;
  initialValues?: any;
  handleCancel: () => void;
  createApp: (app: any) => void;
  updateApp: (app: any) => void;
}

export default class CreateApp extends React.Component<CreateAppProps, any> {
  state = {
    type: "task"
  };
  onSubmit = (values: any) => {
    const { createApp, updateApp, initialValues } = this.props;

    if (!values.name || !values.apptype) {
      return;
    }
    const submitData = {
      id: randomString(12),
      type: values.apptype,
      name: values.name
    };
    if (initialValues.id) {
      updateApp({ ...submitData, id: initialValues.id });
    } else {
      createApp(submitData);
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

  renderFormContent = (type: string) => {
    let content;
    switch (type) {
      case "human":
        content = (
          <Form {...formItemLayout} colon={false}>
            <Field
              name="env"
              render={() => {
                return (
                  <Form.Item label="运行环境">
                    <Radio.Group defaultValue="custom">
                      <Radio.Button value="preSet">预置</Radio.Button>
                      <Radio.Button value="custom">自定义</Radio.Button>
                    </Radio.Group>
                  </Form.Item>
                );
              }}
            />
            <Field
              name="image"
              render={() => {
                return (
                  <Form.Item label="镜像地址">
                    <Input />
                  </Form.Item>
                );
              }}
            />
            <Field
              name="imageAddress"
              render={() => {
                return (
                  <Form.Item label="镜像版本">
                    <Input />
                  </Form.Item>
                );
              }}
            />
            <Field
              name="envVar"
              render={() => {
                return (
                  <Form.Item label="资源配额">
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                    <Input />
                  </Form.Item>
                );
              }}
            />
          </Form>
        );
        break;
      default:
        content = (
          <Form {...formItemLayout} colon={false}>
            <Field
              name="inputs"
              render={({ input, meta }) => {
                const { error, touched } = meta;
                const { onChange, value } = input;
                return (
                  <Form.Item
                    help={touched && error}
                    validateStatus={touched && error ? "error" : ""}
                    label="选择输入"
                  >
                    <Button type="dashed" style={{ width: "60%" }}>
                      <Icon type="plus" /> 数据集
                    </Button>
                    <Button type="dashed" style={{ width: "60%" }}>
                      <Icon type="plus" /> 模型集
                    </Button>
                  </Form.Item>
                );
              }}
            />
            <Field
              name="outputs"
              render={({ input, meta }) => {
                const { error, touched } = meta;
                const { onChange, value } = input;
                return (
                  <Form.Item
                    help={touched && error}
                    validateStatus={touched && error ? "error" : ""}
                    label="选择输出"
                  >
                    <Button type="dashed" style={{ width: "60%" }}>
                      <Icon type="plus" /> 数据集
                    </Button>
                    <Button type="dashed" style={{ width: "60%" }}>
                      <Icon type="plus" /> 模型集
                    </Button>
                  </Form.Item>
                );
              }}
            />
            <Field
              name="desc"
              render={({ input, meta }) => {
                const { error, touched } = meta;
                const { onChange, value } = input;
                return (
                  <Form.Item
                    help={touched && error}
                    validateStatus={touched && error ? "error" : ""}
                    label="描述"
                  >
                    <TextArea />
                  </Form.Item>
                );
              }}
            />
          </Form>
        );
    }
    return content;
  };

  render() {
    const { modalVisible, handleCancel, initialValues } = this.props;

    return (
      <FinalForm
        onSubmit={this.onSubmit}
        validate={this.validate}
        initialValues={initialValues}
        render={({ handleSubmit }) => {
          return (
            <Drawer
              title="新增应用"
              width={720}
              onClose={handleCancel}
              visible={modalVisible}
            >
              {/* <Steps style={{ width: "360px", marginBottom: "10px" }}>
                <Step title="基本信息" />
                <Step title="运行环境" />
              </Steps> */}
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
                          label="任务名称"
                        >
                          <Input onChange={onChange} value={value} />
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
                          label="任务类型"
                        >
                          <Radio.Group
                            disabled={initialValues.id}
                            onChange={(e: any) => {
                              onChange(e.target.value);
                              this.setState({
                                type: e.target.value
                              });
                            }}
                          >
                            <Radio.Button value="task">普通应用</Radio.Button>
                            <Radio.Button value="human">
                              人工参与应用
                            </Radio.Button>
                          </Radio.Group>
                        </Form.Item>
                      );
                    }}
                  />
                  {this.renderFormContent(this.state.type)}
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
