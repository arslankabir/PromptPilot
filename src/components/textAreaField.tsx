function TextAreaField(props: any) {
  return (
    <div className="intdiv">
      <p className="lable">
        {props.title}
        {props.required && <span>*</span>}
      </p>
      <textarea
        className="int"
        placeholder={props.placeholder}
        value={props.value}
        rows={props.rows}
        onChange={(e) => props.setValue(e.target.value)}
      ></textarea>
      {props.err && <p className="err">{props.err}</p>}
      {props.success && <p className="success">{props.success}</p>}
    </div>
  );
}

export default TextAreaField;
