import { Table } from "react-bootstrap";

function PdfContent(props: any) {
  const styles = {
    page: {
      pageBreakAfter: "always" as "always",
      fontSize: "10px",
      width: "370px",
      margin: "0 20px"
    },

    columnLayout: {
      display: "flex",
      justifyContent: "space-between",
      marginTop: "20px"
    }
  };
  return (
    <>
      <div style={styles.page}>
        <div>
          <h2
            style={{
              fontSize: "20px",
              textAlign: "center",
              marginBottom: "30px"
            }}
          >
            Entre Coach
          </h2>
        </div>
        <Table>
          <tbody>
            {props.data.length > 0 &&
              props.data.map(
                (item: { title: string; body: string }, index: number) => (
                  <tr key={index}>
                    <td
                      style={{
                        verticalAlign: "top",
                        paddingRight: "10px"
                      }}
                    >
                      <h5
                        style={{
                          fontSize: "15px",
                          fontWeight: "bold"
                        }}
                      >
                        {item.title}
                      </h5>
                      <p style={{ margin: 0 }}>{item.body}</p>
                    </td>
                  </tr>
                )
              )}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default PdfContent;
