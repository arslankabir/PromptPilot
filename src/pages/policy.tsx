import Layout from "../components/layout";

function Policy(props: any) {
  return (
    <Layout userinfo={props.userinfo}>
      <div className="sub-container">
        <div className="content">
          <h2 className="title">privacy policy</h2>
          <div className="intdiv">
            <p className="lable">Effective Date: Jun 8, 2023</p>
          </div>
          <div className="intdiv">
            <p className="lable">
              This Privacy Policy explains how Go Meta Media LLC ("we," "us," or
              "our") collects, uses, and protects the personal information of
              users ("you" or "your") when you access and use our website and
              services (collectively, "the Service"). By using the Service, you
              consent to the collection and use of your personal information as
              described in this Privacy Policy.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">1. Information We Collect</p>
            <p className="lable">
              a. Personal Information: When you create an account or interact
              with the Service, we may collect personal information, such as
              your name, email address, and other contact details.
            </p>
            <p className="lable">
              b. Usage Information: We may collect information about your use of
              the Service, including your IP address, browser type, operating
              system, and referring URLs.
            </p>
            <p className="lable">
              c. Cookies and Similar Technologies: We may use cookies and
              similar technologies to enhance your experience and collect
              information about your usage patterns within the Service.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">2. How We Use Your Information</p>
            <p className="lable">
              a. Provide and Improve the Service: We use your information to
              provide, operate, maintain, and improve the Service, as well as to
              develop new features and functionalities.
            </p>
            <p className="lable">
              b. Communication: We may use your contact information to send you
              administrative communications, newsletters, marketing materials,
              and other information that may be of interest to you. You can opt
              out of receiving marketing emails by following the unsubscribe
              instructions included in the email.
            </p>
            <p className="lable">
              c. Analytics and Personalization: We may analyze usage data to
              better understand how users interact with the Service and
              personalize your experience.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">3. Data Sharing and Disclosure</p>
            <p className="lable">
              a. Third-Party Service Providers: We may engage third-party
              service providers to perform functions on our behalf, such as
              hosting, data analysis, and customer support. These service
              providers may have access to your personal information as
              necessary for them to perform their functions.
            </p>
            <p className="lable">
              b. Legal Compliance: We may disclose your personal information if
              required by law or if we believe that such action is necessary to
              comply with a legal obligation, protect our rights, or investigate
              potential violations of the law.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">4. Data Retention</p>
            <p className="lable">
              We retain your personal information for as long as necessary to
              fulfill the purposes outlined in this Privacy Policy unless a
              longer retention period is required or permitted by law.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">5. Your Rights</p>
            <p className="lable">
              a. Access and Correction: You have the right to access and update
              your personal information. If you need assistance in accessing or
              updating your personal information, please contact us at
              support@reinvent.co.
            </p>
            <p className="lable">
              b. Data Deletion: You can request the deletion of your personal
              information by contacting us at support@reinvent.co. However,
              please note that certain data may need to be retained for legal or
              legitimate business purposes.
            </p>
            <p className="lable">
              c. Marketing Communications: You can opt out of receiving
              marketing communications from us by following the unsubscribe
              instructions provided in the email.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">6. Data Security</p>
            <p className="lable">
              We implement reasonable security measures to protect the
              confidentiality and integrity of your personal information.
              However, no method of transmission or electronic storage is 100%
              secure, and we cannot guarantee absolute security.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">7. Children's Privacy</p>
            <p className="lable">
              The Service is not directed to individuals under the age of 18. We
              do not knowingly collect personal information from children. If
              you believe that we have inadvertently collected personal
              information from a child, please contact us at
              support@reinvent.co, and we will promptly take appropriate action.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">8. Changes to this Privacy Policy</p>
            <p className="lable">
              We may update this Privacy Policy from time to time. The most
              current version will be indicated by the "Effective Date" at the
              beginning of this Privacy Policy. Your continued use of the
              Service after any modifications to the Privacy Policy constitutes
              your acceptance of the updated terms.
            </p>
          </div>
          <div className="intdiv">
            <p className="sub-title">9. Contact Us</p>
            <p className="lable">
              If you have any questions or concerns about this Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Policy;
