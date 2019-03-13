// @flow
import * as React from "react";

type props = {
  width: number,
  height: number,
  url: string,
  title: string,
  onClose: () => *,
  onCode: (code: string, params: *) => *,
  children?: React.Node
};

export default class OauthPopup extends React.PureComponent<props> {
  static defaultProps = {
    onClose: () => {},
    width: 500,
    height: 500,
    url: "",
    title: ""
  };

  externalWindow: window;
  codeCheck: IntervalID;

  componentWillMount() {
    this.createPopup();
  }

  createPopup = () => {
    const { url, title, width, height, onCode } = this.props;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    this.externalWindow = window.open(
      url,
      title,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    this.codeCheck = setInterval(() => {
      try {
        // checks for successful oauth by "oauth_token_secret" appearing in the URL
        // thanks to the redirect in the backend that changes the url :D
        const params = new URL(this.externalWindow.location).searchParams;
        const code = params.get("oauth_token_secret");
        if (!code) {
          return;
        }
        clearInterval(this.codeCheck);
        onCode(code, params);

        // if oauth successful, automatically close the popup
        this.externalWindow.close();
      } catch (e) {}
    }, 20);

    this.externalWindow.onbeforeunload = () => {
      this.props.onClose();
      clearInterval(this.codeCheck);
    };
  };

  render() {
    return <div onLoad={this.createPopup}> {this.props.children} </div>;
  }

  componentWillUnmount() {
    if (this.externalWindow) {
      this.externalWindow.close();
    }
  }
}
