// Mock React Email components for testing

interface MockComponentProps {
  children?: any;
  [key: string]: any;
}

const createMockComponent = (name: string) => {
  return (props: MockComponentProps) => {
    const { children, ...restProps } = props;
    return {
      type: name,
      props: restProps,
      children,
    };
  };
};

export const Body = createMockComponent('Body');
export const Container = createMockComponent('Container');
export const Head = createMockComponent('Head');
export const Heading = createMockComponent('Heading');
export const Html = createMockComponent('Html');
export const Img = createMockComponent('Img');
export const Link = createMockComponent('Link');
export const Preview = createMockComponent('Preview');
export const Section = createMockComponent('Section');
export const Text = createMockComponent('Text');
