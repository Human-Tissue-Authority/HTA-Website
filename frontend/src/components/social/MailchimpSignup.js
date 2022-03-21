import React from 'react'
import ArrowWhite from '../../images/arrow-white.svg'

const MailchimpSignup = () => (
  <section className="newsletter">
    <h2>Signup for our newsletter</h2>
    <p className="newsletter__intro">Our newsletter gives an overview of our recent activities and developments in the areas we regulate. It is also an important source of information for professionals working in regulated sectors and transplant approvals.</p>
    <form action="https://hta.us9.list-manage.com/subscribe/post?u=8a7f5f861d1a022a25974b965&amp;id=f526b0dbcd" method="POST" noValidate>
      <input
        type="email"
        name="EMAIL"
        id="mce-EMAIL"
        placeholder="Email address"
        className="newsletter__email"
        aria-label="Email address"
        autoComplete="email"
      />
      <fieldset className="user__type">
        <legend>
          <span className="accessibility">Sign up as public or professional user</span>
        </legend>

        <div>
          <input type="radio" value="Public User" name="MMERGE5" id="mce-MMERGE5-0"/>
          <label htmlFor="mce-MMERGE5-0">Public User</label>
        </div>

        <div>
          <input type="radio" value="Professional User" name="MMERGE5" id="mce-MMERGE5-1"/>
          <label htmlFor="mce-MMERGE5-1">Professional User</label>
        </div>
      </fieldset>

      <div className="button__wrapper">
        <img src={ArrowWhite} role="presentation" alt="" />
        <button type="submit" name="subscribe" id="mc-embedded-subscribe" className="button">Sign up</button>
      </div>

      <div style={{position: 'absolute', left: '-5000px'}} aria-hidden>
        <input type="text" name="b_8a7f5f861d1a022a25974b965_f526b0dbcd" tabIndex="-1" value="" readOnly />
      </div>
    </form>
  </section>
)

export default MailchimpSignup
