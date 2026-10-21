<script setup>
import { useAuthStore } from '../stores/auth'
import Icon from '../components/Icon.vue'
const auth = useAuthStore()
const steps = [
  {
    icon: 'box',
    title: 'Place your request',
    text: 'Add pickup and delivery addresses, contact details, and a little about your package.',
  },
  {
    icon: 'users',
    title: 'Meet your courier',
    text: 'An admin assigns a courier. You’ll see who is taking care of your delivery.',
  },
  {
    icon: 'truck',
    title: 'Follow the journey',
    text: 'Check each recorded milestone as your package is picked up and moves into transit.',
  },
  {
    icon: 'check',
    title: 'Keep the whole story',
    text: 'Once delivered, your shipment and its timestamped history stay in your account.',
  },
]
const roles = [
  {
    icon: 'box',
    label: 'FOR CUSTOMERS',
    title: 'Send it. Follow it.',
    text: 'Create delivery requests and find every package in your own shipment history.',
  },
  {
    icon: 'truck',
    label: 'FOR COURIERS',
    title: 'Know your next move.',
    text: 'See assigned deliveries, find contact details, and record each completed milestone.',
  },
  {
    icon: 'chart',
    label: 'FOR ADMINS',
    title: 'Keep things moving.',
    text: 'Assign couriers, manage your team, and get a clear picture of delivery activity.',
  },
]
</script>

<template>
  <div class="landing-page">
    <a class="skip-link" href="#landing-main">Skip to content</a>
    <header class="landing-header landing-container">
      <RouterLink to="/" class="brand" aria-label="Deliveria home"
        ><span class="brand-mark"><Icon name="box" :size="23" /></span>deliveria<span
          class="brand-period"
          >.</span
        ></RouterLink
      >
      <nav class="landing-nav" aria-label="Main navigation">
        <a href="#how-it-works">How it works</a>
        <a href="#built-for-you">Built for you</a>
      </nav>
      <div class="landing-header-actions">
        <RouterLink v-if="auth.isLoggedIn" :to="auth.home" class="button button-primary"
          >Your workspace <Icon name="arrow" :size="16"
        /></RouterLink>
        <template v-else
          ><RouterLink to="/login" class="landing-sign-in">Sign in</RouterLink
          ><RouterLink to="/register" class="button button-primary"
            >Get started <Icon name="arrow" :size="16" /></RouterLink
        ></template>
      </div>
    </header>

    <main id="landing-main" tabindex="-1">
      <section class="landing-hero landing-container" aria-labelledby="hero-title">
        <div class="hero-copy">
          <span class="landing-kicker"
            ><span class="online-dot" /> A LITTLE MORE CERTAINTY, EVERY DELIVERY</span
          >
          <h1 id="hero-title">Good things.<br /><span>On their way.</span></h1>
          <p>
            From the first pickup to the final doorstep. Request a delivery, follow its progress,
            and keep every package in view.
          </p>
          <div class="hero-actions">
            <RouterLink
              :to="auth.isLoggedIn ? auth.home : '/register'"
              class="button button-primary"
              >{{ auth.isLoggedIn ? 'Open your workspace' : 'Start your first delivery'
              }}<Icon name="arrow" :size="18" /></RouterLink
            ><a href="#how-it-works" class="hero-secondary"
              >See how it works <span aria-hidden="true">↗</span></a
            >
          </div>
          <div class="hero-assurance">
            <Icon name="shield" :size="17" /><span
              >Your deliveries. Your account. Every step recorded.</span
            >
          </div>
        </div>
        <div
          class="hero-visual"
          role="img"
          aria-label="Illustrated example of a delivery from Jakarta to Bandung, currently in transit"
        >
          <span class="visual-caption">A DELIVERY, AT A GLANCE</span>
          <div class="visual-orbit orbit-one" aria-hidden="true" />
          <div class="visual-orbit orbit-two" aria-hidden="true" />
          <svg class="visual-route" viewBox="0 0 500 450" fill="none" aria-hidden="true">
            <path
              d="M60 330C-20 230 130 160 200 250S420 310 435 100"
              stroke="#a1b99b"
              stroke-width="2"
              stroke-dasharray="5 8"
            />
            <circle cx="60" cy="330" r="6" fill="#789872" />
            <circle cx="435" cy="100" r="6" fill="#789872" />
          </svg>
          <div class="pickup-note">
            <span class="pickup-note-icon"><Icon name="check" :size="15" /></span>
            <div><strong>Picked up</strong><small>A step closer to your doorstep.</small></div>
          </div>
          <svg class="landing-parcel" viewBox="0 0 300 280" fill="none" aria-hidden="true">
            <ellipse cx="156" cy="254" rx="104" ry="17" fill="#c4d1b6" opacity=".4" />
            <path d="m42 88 114-59 108 59-111 62Z" fill="#dac49b" />
            <path d="M42 88v115l111 64V150Z" fill="#c9ad7d" />
            <path d="m153 150 111-62v116l-111 63Z" fill="#b99a68" />
            <path d="m91 62 111 60 24-13-111-60Z" fill="#eddfbf" />
            <path d="m202 122 24-13v47l-24 13Z" fill="#d4c29c" />
            <path d="m63 139 64 36v48l-64-37Z" fill="#f4ecd9" />
            <path d="m73 158 42 24m-42-14 29 17" stroke="#b09b77" stroke-width="3" />
            <path
              d="m181 208 20-11m-20 18 20-11m-20 18 12-7"
              stroke="#eee2c4"
              stroke-width="3"
              stroke-linecap="round"
            />
            <path
              d="M42 88 153 150m0 0 111-62m-111 62v117"
              stroke="#a28860"
              stroke-opacity=".35"
              stroke-width="1.5"
            />
          </svg>
          <div class="example-delivery">
            <div class="example-top">
              <span class="example-package"><Icon name="box" :size="19" /></span>
              <div><strong>A journey worth following.</strong><small>Example shipment</small></div>
              <span class="example-status">In Transit</span>
            </div>
            <div class="example-route">
              <div><small>FROM</small><strong>Jakarta</strong></div>
              <span class="route-dashes" aria-hidden="true" /><Icon name="truck" :size="20" /><span
                class="route-dashes"
                aria-hidden="true"
              />
              <div><small>TO</small><strong>Bandung</strong></div>
            </div>
            <div class="example-progress" aria-hidden="true"><span /><span /><span /><span /></div>
            <div class="example-stages">
              <span>Placed</span><span>Picked up</span><span>In transit</span><span>Delivered</span>
            </div>
          </div>
          <span class="visual-footnote"
            ><Icon name="pin" :size="13" /> Every package has a story. Follow yours.</span
          >
        </div>
      </section>

      <div class="landing-benefits">
        <div class="landing-container benefits-inner">
          <span><Icon name="box" /> Simple delivery requests</span
          ><span><Icon name="clock" /> A history of every milestone</span
          ><span><Icon name="shield" /> Private tracking in your account</span>
        </div>
      </div>

      <section
        id="how-it-works"
        class="landing-section landing-container"
        aria-labelledby="how-title"
      >
        <div class="landing-section-heading">
          <span class="eyebrow">FROM HERE TO THERE</span>
          <h2 id="how-title">Four steps. One clear journey.</h2>
          <p>A straightforward way to send, follow, and manage your deliveries.</p>
        </div>
        <ol class="landing-steps">
          <li v-for="(step, index) in steps" :key="step.title">
            <div class="step-top">
              <span class="step-icon"><Icon :name="step.icon" :size="24" /></span
              ><span class="step-number">0{{ index + 1 }}</span>
            </div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </li>
        </ol>
      </section>

      <section id="built-for-you" class="landing-role-section" aria-labelledby="roles-title">
        <div class="landing-container">
          <div class="landing-section-heading">
            <span class="eyebrow">CONNECTED, FROM END TO END</span>
            <h2 id="roles-title">Different roles. The same destination.</h2>
            <p>One shared delivery journey, with a workspace for everyone involved.</p>
          </div>
          <div class="landing-roles">
            <article v-for="role in roles" :key="role.label">
              <Icon :name="role.icon" :size="29" /><span class="eyebrow">{{ role.label }}</span>
              <h3>{{ role.title }}</h3>
              <p>{{ role.text }}</p>
            </article>
          </div>
          <p class="team-account-note">
            <Icon name="users" :size="16" />Customers can create an account. Courier accounts are
            set up by an admin.
          </p>
        </div>
      </section>

      <section class="landing-container landing-cta-wrap" aria-labelledby="cta-title">
        <div class="landing-cta">
          <div>
            <span class="eyebrow">YOUR NEXT DELIVERY STARTS HERE</span>
            <h2 id="cta-title">Less wondering.<br />More on its way.</h2>
            <p>Bring your deliveries together with Deliveria.</p>
          </div>
          <RouterLink :to="auth.isLoggedIn ? auth.home : '/register'" class="button"
            >{{ auth.isLoggedIn ? 'Go to your workspace' : 'Create your account'
            }}<Icon name="arrow" :size="18" /></RouterLink
          ><Icon class="cta-parcel" name="box" :size="190" />
        </div>
      </section>
    </main>
    <footer class="landing-footer landing-container">
      <RouterLink to="/" class="brand" aria-label="Deliveria home"
        ><span class="brand-mark"><Icon name="box" :size="20" /></span>deliveria<span
          class="brand-period"
          >.</span
        ></RouterLink
      >
      <p>Delivery operations, made simple.</p>
      <span>© {{ new Date().getFullYear() }} Deliveria</span
      ><RouterLink :to="auth.isLoggedIn ? auth.home : '/login'"
        >{{ auth.isLoggedIn ? 'Your workspace' : 'Sign in' }}
        <span aria-hidden="true">↗</span></RouterLink
      >
    </footer>
  </div>
</template>

<style scoped>
.landing-page {
  background: #fcfdf9;
  color: #263c2e;
}
.landing-container {
  width: min(1160px, calc(100% - 80px));
  margin-inline: auto;
}
.landing-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-block: 28px;
}
.landing-nav {
  flex-direction: row;
  gap: 28px;
}
.landing-nav a {
  padding: 8px 0;
  font-size: 13px;
  color: #617266;
  font-weight: 500;
}
.landing-nav a:hover {
  background: transparent;
  color: var(--green);
}
.landing-header-actions {
  display: flex;
  align-items: center;
  gap: 25px;
}
.landing-sign-in {
  font-size: 13px;
  font-weight: 600;
}
.landing-header .button {
  padding-inline: 20px;
}
.landing-hero {
  display: grid;
  grid-template-columns: 1.05fr 1fr;
  gap: 55px;
  align-items: center;
  padding-block: 65px 85px;
}
.landing-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #647c64;
  font-size: 10px;
  font-weight: 650;
  letter-spacing: 1.1px;
}
.landing-kicker .online-dot {
  box-shadow: 0 0 0 4px #eaf0e4;
}
.hero-copy h1 {
  font-size: clamp(48px, 5.5vw, 76px);
  line-height: 1.09;
  letter-spacing: -3.5px;
  font-weight: 750;
  margin: 25px 0;
  color: #233e2c;
}
.hero-copy h1 > span {
  color: #78916a;
}
.hero-copy > p {
  max-width: 440px;
  font-size: 16px;
  line-height: 1.85;
  color: #74816f;
}
.hero-actions {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-top: 33px;
}
.hero-actions > .button {
  min-height: 49px;
  padding-inline: 21px;
}
.hero-secondary {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  white-space: nowrap;
  font-size: 13px;
  color: #4d6751;
  font-weight: 550;
}
.hero-secondary span {
  font-size: 20px;
}
.hero-assurance {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #82917a;
  font-size: 11px;
  margin-top: 25px;
}
.hero-visual {
  position: relative;
  height: 485px;
  border-radius: 140px 140px 28px 28px;
  background: #eaf0e2;
  isolation: isolate;
  min-width: 0;
}
.visual-caption {
  position: absolute;
  top: 31px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 9px;
  letter-spacing: 1.8px;
  color: #819373;
  font-weight: 650;
}
.visual-orbit {
  position: absolute;
  border: 1px solid #dce5d1;
  border-radius: 50%;
  pointer-events: none;
  z-index: -1;
}
.orbit-one {
  width: 310px;
  height: 310px;
  top: 35px;
  left: calc(50% - 155px);
}
.orbit-two {
  width: 390px;
  height: 390px;
  top: 0;
  left: calc(50% - 195px);
}
.visual-route {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
.landing-parcel {
  position: absolute;
  width: 252px;
  height: 240px;
  left: calc(50% - 126px);
  top: 57px;
  transform: rotate(-7deg);
}
.pickup-note {
  position: absolute;
  z-index: 2;
  left: -19px;
  top: 122px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e3e9dd;
  padding: 13px 16px;
  background: #fffef9;
  border-radius: 10px;
  box-shadow: 0 9px 25px #3c51250b;
  transform: rotate(-5deg);
}
.pickup-note-icon {
  display: grid;
  place-items: center;
  background: #eaf2e3;
  color: #71905c;
  width: 27px;
  height: 27px;
  border-radius: 50%;
}
.pickup-note strong {
  display: block;
  font-size: 11px;
  color: #526b43;
}
.pickup-note small {
  display: block;
  font-size: 9px;
  color: #8a967c;
  margin-top: 2px;
}
.example-delivery {
  position: absolute;
  bottom: 52px;
  left: 26px;
  right: -15px;
  background: #fffefa;
  border: 1px solid #e4e9dc;
  border-radius: 13px;
  box-shadow: 0 16px 40px #42582f12;
  padding: 22px;
}
.example-top {
  display: flex;
  align-items: center;
  gap: 10px;
}
.example-package {
  width: 37px;
  height: 39px;
  background: #eef2e7;
  color: #839773;
  border-radius: 7px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}
.example-top strong {
  display: block;
  font-size: 12px;
  font-weight: 650;
}
.example-top small {
  display: block;
  font-size: 10px;
  color: #919c87;
  margin-top: 3px;
}
.example-status {
  font-size: 10px;
  color: #457657;
  background: #eaf4e9;
  border-radius: 5px;
  padding: 5px 9px;
  margin-left: auto;
  white-space: nowrap;
}
.example-route {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 23px;
  color: #96aa88;
}
.example-route > div {
  min-width: 62px;
}
.example-route > div:last-child {
  text-align: right;
}
.example-route small {
  display: block;
  font-size: 8px;
  letter-spacing: 1.3px;
  color: #98a38e;
}
.example-route strong {
  display: block;
  font-size: 14px;
  font-weight: 550;
  color: #5c6e50;
  margin-top: 4px;
}
.route-dashes {
  height: 1px;
  border-top: 1px dashed #cfdbc3;
  flex: 1;
}
.example-progress {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  margin-top: 24px;
}
.example-progress > span {
  height: 4px;
  background: #80a16b;
  border-radius: 4px;
}
.example-progress > span:nth-child(3) {
  background: #4e7c50;
}
.example-progress > span:last-child {
  background: #e7eddf;
}
.example-stages {
  display: flex;
  justify-content: space-between;
  font-size: 9px;
  color: #839378;
  margin-top: 8px;
}
.visual-footnote {
  position: absolute;
  bottom: 19px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  color: #8c9e7e;
  font-size: 9px;
}
.landing-benefits {
  border-block: 1px solid #e4eadd;
  background: #f5f7ef;
}
.benefits-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 25px;
  padding-block: 25px;
}
.benefits-inner > span {
  display: flex;
  align-items: center;
  gap: 11px;
  font-size: 12px;
  color: #6c8061;
}
.benefits-inner svg {
  color: #8aa17d;
}
.landing-section {
  padding-block: 90px;
}
.landing-section-heading {
  text-align: center;
  max-width: 680px;
  margin: 0 auto 44px;
}
.landing-section-heading h2 {
  font-size: 34px;
  line-height: 1.3;
  letter-spacing: -1.1px;
  margin: 14px 0;
  color: #2f4734;
}
.landing-section-heading > p {
  font-size: 14px;
  color: #819078;
}
.landing-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 32px;
  padding: 0;
  list-style: none;
  margin: 0;
}
.step-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 23px;
}
.step-icon {
  width: 52px;
  height: 52px;
  background: #edf2e7;
  border: 1px solid #e1e9d9;
  border-radius: 13px;
  display: grid;
  place-items: center;
  color: #6e8a5f;
}
.step-number {
  font-family: 'Manrope', sans-serif;
  font-size: 28px;
  font-weight: 650;
  color: #dce5d2;
}
.landing-steps h3 {
  font-size: 16px;
  letter-spacing: -0.3px;
  margin-bottom: 11px;
}
.landing-steps p {
  font-size: 13px;
  color: #7e8c75;
  line-height: 1.85;
}
.landing-role-section {
  padding-block: 75px;
  background: #f1f5eb;
  border-block: 1px solid #e6ecdf;
}
.landing-roles {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 45px;
}
.landing-roles article {
  padding: 10px 25px 10px 0;
}
.landing-roles article + article {
  border-left: 1px solid #dce6d4;
  padding-left: 35px;
}
.landing-roles article > svg {
  display: block;
  color: #7d9970;
  margin-bottom: 26px;
}
.landing-roles .eyebrow {
  color: #8a9d7b;
  font-size: 9px;
}
.landing-roles h3 {
  font-size: 23px;
  margin: 11px 0;
  letter-spacing: -0.7px;
  color: #3e573e;
}
.landing-roles p {
  font-size: 13px;
  color: #7b8b70;
  line-height: 1.85;
}
.team-account-note {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 11px;
  color: #7b8e70;
  margin-top: 40px;
}
.landing-cta-wrap {
  padding-block: 70px;
}
.landing-cta {
  background: #245a40;
  color: white;
  border-radius: 18px;
  padding: 48px 55px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  position: relative;
  isolation: isolate;
  overflow: hidden;
}
.landing-cta .eyebrow {
  color: #afc4a5;
  font-size: 9px;
  letter-spacing: 1.4px;
}
.landing-cta h2 {
  font-size: 43px;
  line-height: 1.17;
  letter-spacing: -1.6px;
  color: #f7f8ec;
  margin: 16px 0;
}
.landing-cta p {
  color: #b1c6ac;
  font-size: 13px;
}
.landing-cta > .button {
  background: #edf2dd;
  color: #2c583c;
  min-height: 49px;
  padding-inline: 22px;
}
.landing-cta > .button:hover {
  background: #fffef3;
}
.cta-parcel {
  position: absolute;
  right: 115px;
  bottom: -45px;
  color: #a7b996;
  opacity: 0.12;
  transform: rotate(-16deg);
  z-index: -1;
}
.landing-footer {
  display: flex;
  align-items: center;
  gap: 23px;
  padding-block: 0 32px;
}
.landing-footer .brand {
  font-size: 22px;
}
.landing-footer .brand-mark {
  width: 32px;
  height: 32px;
  border-radius: 9px;
}
.landing-footer p {
  font-size: 11px;
  color: #8c9983;
}
.landing-footer > span {
  margin-left: auto;
  font-size: 10px;
  color: #98a38e;
}
.landing-footer > a:last-child {
  font-size: 12px;
  font-weight: 550;
}
.landing-footer > a:last-child span {
  margin-left: 6px;
}
@media (max-width: 1050px) {
  .landing-container {
    width: calc(100% - 60px);
  }
  .landing-nav {
    gap: 18px;
  }
  .landing-hero {
    gap: 32px;
    padding-block: 45px 65px;
  }
  .hero-copy h1 {
    font-size: 59px;
    letter-spacing: -2.7px;
  }
  .hero-copy > p {
    font-size: 14px;
  }
  .hero-actions {
    gap: 18px;
    flex-wrap: wrap;
  }
  .hero-visual {
    height: 455px;
  }
  .example-delivery {
    left: 8px;
    right: -6px;
    padding: 18px;
  }
  .pickup-note {
    left: -12px;
    top: 120px;
  }
  .landing-steps {
    gap: 23px;
  }
  .landing-roles {
    gap: 25px;
  }
  .landing-section-heading h2 {
    font-size: 30px;
  }
  .landing-footer p {
    display: none;
  }
}
@media (max-width: 800px) {
  .landing-header {
    gap: 15px;
  }
  .landing-nav {
    display: none;
  }
  .landing-header-actions {
    gap: 18px;
  }
  .landing-hero {
    grid-template-columns: 1fr;
    gap: 45px;
    padding-top: 35px;
  }
  .hero-copy {
    max-width: 550px;
  }
  .hero-copy h1 {
    font-size: 68px;
  }
  .hero-copy > p {
    font-size: 16px;
    max-width: 480px;
  }
  .hero-visual {
    width: min(480px, 100% - 15px);
    justify-self: center;
    height: 470px;
  }
  .hero-actions {
    gap: 25px;
  }
  .hero-assurance {
    font-size: 11px;
  }
  .example-delivery {
    left: 25px;
    right: -12px;
    padding: 22px;
  }
  .benefits-inner {
    gap: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }
  .benefits-inner > span {
    font-size: 11px;
  }
  .landing-section {
    padding-block: 65px;
  }
  .landing-steps {
    grid-template-columns: 1fr 1fr;
    gap: 35px;
  }
  .landing-role-section {
    padding-block: 60px;
  }
  .landing-roles {
    gap: 18px;
  }
  .landing-roles article {
    padding-right: 0;
  }
  .landing-roles article + article {
    padding-left: 20px;
  }
  .landing-roles h3 {
    font-size: 20px;
  }
  .landing-roles p {
    font-size: 12px;
  }
  .landing-cta {
    padding: 35px;
  }
  .landing-cta h2 {
    font-size: 36px;
  }
  .landing-cta > .button {
    font-size: 12px;
    padding-inline: 16px;
  }
  .landing-footer {
    gap: 15px;
  }
}
@media (max-width: 500px) {
  .landing-container {
    width: calc(100% - 40px);
  }
  .landing-header {
    padding-block: 20px;
    gap: 12px;
  }
  .landing-header .brand {
    font-size: 23px;
  }
  .landing-header .brand-mark {
    width: 33px;
    height: 33px;
    margin-right: 7px;
  }
  .landing-header-actions {
    gap: 14px;
  }
  .landing-header .button {
    padding: 10px 12px;
    font-size: 11px;
    min-height: 38px;
  }
  .landing-header .button svg {
    display: none;
  }
  .landing-sign-in {
    font-size: 12px;
  }
  .landing-hero {
    padding-block: 27px 45px;
    gap: 37px;
  }
  .landing-kicker {
    font-size: 8px;
    letter-spacing: 0.7px;
  }
  .hero-copy h1 {
    font-size: clamp(40px, 12.8vw, 48px);
    letter-spacing: -2.7px;
    margin: 22px 0;
  }
  .hero-copy > p {
    font-size: 14px;
    line-height: 1.85;
  }
  .hero-actions {
    gap: 19px;
    margin-top: 27px;
  }
  .hero-actions .button {
    font-size: 12px;
    padding-inline: 17px;
    min-height: 46px;
  }
  .hero-secondary {
    font-size: 12px;
  }
  .hero-assurance {
    font-size: 9px;
    gap: 7px;
    margin-top: 20px;
  }
  .hero-visual {
    height: 410px;
    width: calc(100% - 8px);
    border-radius: 100px 100px 22px 22px;
  }
  .visual-caption {
    font-size: 8px;
    top: 24px;
  }
  .orbit-one {
    width: 240px;
    height: 240px;
    left: calc(50% - 120px);
    top: 38px;
  }
  .orbit-two {
    width: 280px;
    height: 280px;
    left: calc(50% - 140px);
    top: 18px;
  }
  .landing-parcel {
    width: 210px;
    height: 200px;
    left: calc(50% - 105px);
    top: 50px;
  }
  .pickup-note {
    left: -7px;
    top: 104px;
    padding: 10px 11px;
    gap: 7px;
  }
  .pickup-note strong {
    font-size: 10px;
  }
  .pickup-note small {
    font-size: 8px;
  }
  .pickup-note-icon {
    width: 23px;
    height: 23px;
  }
  .example-delivery {
    left: 9px;
    right: -6px;
    bottom: 43px;
    padding: 17px 15px;
  }
  .example-top {
    gap: 8px;
  }
  .example-top strong {
    font-size: 10px;
  }
  .example-top small {
    font-size: 8px;
  }
  .example-package {
    width: 30px;
    height: 33px;
  }
  .example-status {
    font-size: 8px;
    padding: 4px 6px;
  }
  .example-route {
    margin-top: 20px;
    gap: 7px;
  }
  .example-route strong {
    font-size: 13px;
  }
  .example-stages {
    font-size: 8px;
  }
  .example-progress {
    margin-top: 21px;
  }
  .visual-footnote {
    font-size: 8px;
    bottom: 16px;
  }
  .benefits-inner {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    padding-block: 24px;
  }
  .benefits-inner > span {
    font-size: 12px;
    gap: 13px;
  }
  .landing-section {
    padding-block: 50px;
  }
  .landing-section-heading {
    text-align: left;
    margin-bottom: 30px;
  }
  .landing-section-heading h2 {
    font-size: 28px;
    letter-spacing: -0.9px;
    margin-block: 12px;
  }
  .landing-section-heading > p {
    font-size: 13px;
    line-height: 1.8;
  }
  .landing-steps {
    gap: 28px 20px;
  }
  .step-icon {
    width: 43px;
    height: 43px;
    border-radius: 11px;
  }
  .step-number {
    font-size: 23px;
  }
  .step-top {
    margin-bottom: 17px;
  }
  .landing-steps h3 {
    font-size: 15px;
    line-height: 1.45;
  }
  .landing-steps p {
    font-size: 12px;
    line-height: 1.8;
  }
  .landing-role-section {
    padding-block: 45px;
  }
  .landing-roles {
    grid-template-columns: 1fr;
    gap: 25px;
  }
  .landing-roles article {
    padding: 0 0 25px;
  }
  .landing-roles article + article {
    padding: 0 0 25px;
    border-left: 0;
  }
  .landing-roles article:not(:last-child) {
    border-bottom: 1px solid #dce6d4;
  }
  .landing-roles article > svg {
    margin-bottom: 17px;
  }
  .landing-roles h3 {
    font-size: 23px;
  }
  .landing-roles p {
    font-size: 13px;
    max-width: 310px;
  }
  .team-account-note {
    text-align: left;
    align-items: flex-start;
    justify-content: flex-start;
    font-size: 11px;
    line-height: 1.8;
    margin-top: 5px;
  }
  .landing-cta-wrap {
    padding-block: 40px;
  }
  .landing-cta {
    align-items: flex-start;
    flex-direction: column;
    padding: 30px 25px;
    gap: 25px;
  }
  .landing-cta h2 {
    font-size: 36px;
  }
  .landing-cta p {
    font-size: 12px;
  }
  .landing-cta .eyebrow {
    font-size: 8px;
    letter-spacing: 0.8px;
  }
  .cta-parcel {
    right: -35px;
    bottom: 0;
  }
  .landing-footer {
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 18px;
    padding-bottom: 27px;
  }
  .landing-footer > .brand {
    width: 100%;
  }
  .landing-footer > span {
    margin-left: 0;
  }
  .landing-footer > a:last-child {
    font-size: 11px;
  }
}
</style>
