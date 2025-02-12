function TextField(props: any) {
  return (
    <div className="intdiv">
      <p className="lable">
        {props.title}
        {props.required && <span>*</span>}
      </p>
      <input
        className="int"
        placeholder={props.placeholder}
        value={props.value}
        type={props.type ? props.type : "text"}
        onChange={(e) => props.setValue(e.target.value)}
        style={props.style}
        disabled={props.disabled}
        onKeyUp={props.onKeyUp}
      />
      {props.err && <p className="err">{props.err}</p>}
      {props.success && <p className="success">{props.success}</p>}
    </div>
  );
}

export default TextField;
