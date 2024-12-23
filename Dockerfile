FROM apify/actor-node-puppeteer-chrome:latest

COPY --chown=myuser package*.json ./

RUN npm --quiet set progress=false \
    && npm install --omit=dev --omit=optional \
    && npm update \
    && echo "Installed NPM packages:" \
    && (npm list --omit=dev --all || true) \
    && echo "Node.js version:" \
    && node --version \
    && echo "NPM version:" \
    && npm --version \
    && rm -r ~/.npm

COPY --chown=myuser . ./

ENV APIFY_CHROME_EXECUTABLE_PATH=/usr/bin/google-chrome
ENV APIFY_DISABLE_OUTDATED_WARNING=1
ENV npm_config_loglevel=silent

CMD ./start_xvfb_and_run_cmd.sh && npm start
