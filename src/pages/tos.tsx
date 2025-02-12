import Layout from "../components/layout";

function Tos(props: any) {
  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <h2 className="title">
            Reinvent (Go Meta Media LLC) Terms of Service
          </h2>
          <div className="intdiv">
            <p className="sub-title">1. Acceptance of Terms</p>
            <p className="lable">
              By accessing and using the Reinvent platform by Go Meta Media LLC
              ("the Service"), you agree to comply with these Terms of Service.
              If you do not agree to these terms, please refrain from using the
              Service.
            </p>
            <div className="intdiv">
              <p className="sub-title">2. Use of the Service</p>
              <p className="lable">
                a. Eligibility: You must be at least 18 years old to use the
                Service. By using the Service, you represent and warrant that
                you are of legal age to form a binding contract.
              </p>
              <p className="lable">
                b. Account Creation: In order to use certain features of the
                Service, you may be required to create an account. You are
                responsible for maintaining the confidentiality of your account
                credentials and for any activities that occur under your
                account.
              </p>
              <p className="lable">
                c. User Content: You are solely responsible for any content you
                create, submit, or display through the Service. You retain all
                ownership rights to your content, but by using the Service, you
                grant Go Meta Media LLC a non-exclusive, royalty-free license to
                use, reproduce, modify, and distribute your content for the
                purpose of providing the Service.
              </p>
            </div>
          </div>
          <div className="intdiv">
            <p className="sub-title">3. Data Privacy and Security</p>
            <p className="lable">
              a. Collection and Use of Data: Go Meta Media LLC respects your
              privacy and is committed to protecting your personal information.
              Please refer to our Privacy Policy for detailed information on how
              we collect, use, and protect your data.
            </p>
            <p className="lable">
              b. User Data Deletion: If you wish to delete your personal data,
              please contact us at support@reinvent.co with your request. We
              will make reasonable efforts to respond to your request in a
              timely manner, in compliance with applicable laws and regulations.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">4. Intellectual Property</p>
            <p className="lable">
              a. Ownership: All intellectual property rights related to the
              Service (excluding user-generated content) are the property of Go
              Meta Media LLC. You agree not to reproduce, modify, distribute, or
              create derivative works based on the Service without prior written
              permission from Go Meta Media LLC.
            </p>
            <p className="lable">
              b. User Feedback: We welcome your feedback, comments, or
              suggestions regarding the Service. By providing us with such
              feedback, you grant Go Meta Media LLC the right to use and
              incorporate your feedback for any purpose without any compensation
              or attribution to you.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">5. Limitation of Liability</p>
            <p className="lable">
              To the extent permitted by law, Go Meta Media LLC shall not be
              liable for any direct, indirect, incidental, special,
              consequential, or exemplary damages, including but not limited to,
              damages for loss of profits, data, or other intangible losses
              arising out of or in connection with the use or inability to use
              the Service.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">6. Modifications and Termination</p>
            <p className="lable">
              Go Meta Media LLC reserves the right to modify or terminate the
              Service at any time, with or without notice. We may also update
              these Terms of Service from time to time. Your continued use of
              the Service after any modifications to the Terms of Service
              constitutes your acceptance of the updated terms.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">7. Governing Law and Jurisdiction</p>
            <p className="lable">
              These Terms of Service shall be governed by and construed in
              accordance with the laws of New Jersey. Any legal disputes arising
              from or relating to the Service or these terms shall be subject to
              the exclusive jurisdiction of the courts located in New Jersey.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">8. Contact Us</p>
            <p className="lable">
              If you have any questions or concerns about these Terms of
              Service, please contact us at support@reinvent.co
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Tos;
