import { Button } from "react-bootstrap";

function ButtonEle(props: any) {
  return (
    <Button className="btn-ele" onClick={props.handle} style={props.style}>
      {props.title}
    </Button>
  );
}

export default ButtonEle;
