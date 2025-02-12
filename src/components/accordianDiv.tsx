interface accordianDivProps {
  flag: any;
  children: any;
}

const AccordianDiv: React.FC<accordianDivProps> = ({ children, flag }) => {
  return (
    <div
      style={{
        maxHeight: flag ? 1000 : 0,
        transition: "all ease 0.5s",
        overflow: "hidden"
      }}
    >
      {children}
    </div>
  );
};

export default AccordianDiv;
