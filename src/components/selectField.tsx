function SelectField(props: any) {
  return (
    <div className="intdiv">
      <p className="lable">
        {props.title}
        {props.required && <span>*</span>}
      </p>
      <select
        className="int w-full"
        value={props.value}
        onChange={(e) => props.setValue(e.target.value)}
      >
        {props.options.map((item: any, index: number) => (
          <option
            key={index}
            value={props.type && props.type === "val" ? item : item.phoneNumber}
          >
            {props.type && props.type === "val" ? item : item.phoneNumber}
          </option>
        ))}
      </select>

      {props.err && <p className="err">{props.err}</p>}
      {props.success && <p className="success">{props.success}</p>}
    </div>
  );
}

export default SelectField;
