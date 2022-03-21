// conditionally wraps children element(s) for example, you could conditionally wrap an image in a <a> tag.
const ConditionalWrapper = ({ condition, wrapper, elseWrapper, children }) => {
  if (condition) {
    return wrapper(children)
  }

  if (elseWrapper) {
    return elseWrapper(children)
  }

  return children;
}

export default ConditionalWrapper;

/* Example usage:
<ConditionalWrapper
  condition={link}
  wrapper={children => <a href={link}>{children}</a>}
>
  <img src="/some/example/image" />
</ConditionalWrapper>

Credit: https://blog.hackages.io/conditionally-wrap-an-element-in-react-a8b9a47fab2
*/
