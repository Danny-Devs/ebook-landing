<script>
  import { FaqItem, Button } from '$components';
  import twitterIcon from '$assets/icons/twitter.webp';
</script>

<section class="landing-page-section">
  <h2 class="mb-l">Frequently Asked Questions</h2>
  <div class="faq-container">
    <FaqItem />
  </div>
  <div class="additional-info">
    <Button class="mt-s">BUY NOW</Button>
    <div class="mt-m">Any other questions?</div>
    <a href="https://x.com/KIZO_ES" target="_blank">
      <p>
        Hit me up on X
        <img src={twitterIcon} alt="" class="twitter-icon" />
      </p>
    </a>
  </div>
</section>

<style>
  .additional-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: grey;
  }

  .twitter-icon {
    width: 16px;
    height: 16px;
  }

  .additional-info a {
    text-decoration: underline;
  }
</style>
