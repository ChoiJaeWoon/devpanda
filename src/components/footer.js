/**
 * DevPanda — Footer Component
 */

export function renderFooter() {
  const footer = document.getElementById('footer');
  if (!footer) return;

  const year = new Date().getFullYear();

  footer.innerHTML = `
    <div class="footer">
      <div class="footer__inner">

        <!-- Brand col -->
        <div class="footer__brand">
          <div class="footer__logo">
            <span class="footer__logo-icon">🐼</span>
            <span class="footer__logo-text">DevPanda</span>
          </div>
          <p class="footer__tagline">
            Browser-based utilities for AI/ML and general developers.<br>
            No install. No signup. Just open and use.
          </p>
          <div class="footer__stats-grid">
            <div class="footer__brand-stat">🛠️ <strong>22+</strong> Tools</div>
            <div class="footer__brand-stat">🔒 <strong>0</strong> Data stored</div>
            <div class="footer__brand-stat">⚡ <strong>100%</strong> In-browser</div>
            <div class="footer__brand-stat">🆓 <strong>Always</strong> Free</div>
          </div>
        </div>

        <!-- Tools col -->
        <div class="footer__col footer__col--no-multicol">
          <div class="footer__col-title">Tools</div>
          <a class="footer__link" href="#/?filter=dev">🛠️ General Dev Tools</a>
          <a class="footer__link" href="#/?filter=ai">🤖 AI / ML Tools</a>
          <a class="footer__link" href="#/">🏠 View All Tools</a>
        </div>

        <!-- Resources col -->
        <div class="footer__col footer__col--no-multicol">
          <div class="footer__col-title">Resources</div>
          <a class="footer__link" href="https://colab.research.google.com" target="_blank" rel="noopener">Google Colab ↗</a>
          <a class="footer__link" href="https://kaggle.com" target="_blank" rel="noopener">Kaggle ↗</a>
          <a class="footer__link" href="https://huggingface.co" target="_blank" rel="noopener">Hugging Face ↗</a>
          <a class="footer__link" href="https://paperswithcode.com" target="_blank" rel="noopener">Papers with Code ↗</a>
          <a class="footer__link" href="https://roboflow.com" target="_blank" rel="noopener">Roboflow ↗</a>
        </div>

        <!-- Contact col -->
        <div class="footer__col footer__col--no-multicol">
          <div class="footer__col-title">Contact</div>
          <a class="footer__link" href="mailto:devpanda@nullpoint.cloud">📧 devpanda@nullpoint.cloud</a>
          <span class="footer__link" style="cursor:default;opacity:0.6;">🐛 Bug reports welcome</span>
        </div>

      </div>

      <!-- Bottom bar -->
      <div class="footer__bottom">
        <div>
          <span>© ${year} DevPanda. Built with ❤️ for developers.</span>
          <span class="footer__credits">
            Powered by
            <a href="https://news.ycombinator.com" target="_blank" rel="noopener">Hacker News</a> ·
            <a href="https://dev.to" target="_blank" rel="noopener">Dev.to</a> ·
            <a href="https://microlink.io" target="_blank" rel="noopener">Microlink</a> ·
            <a href="https://fonts.google.com" target="_blank" rel="noopener">Google Fonts</a>
          </span>
        </div>
        <span class="footer__bottom-right">
          <a class="footer__bottom-link" href="https://github.com/ChoiJaeWoon/devpanda" target="_blank" rel="noopener">GitHub</a>
          <span>·</span>
          <a class="footer__bottom-link" href="#/">Home</a>
        </span>
      </div>
    </div>
  `;
}
