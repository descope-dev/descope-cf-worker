<img width="1400" alt="cloudflare worker github repo banner" src="https://github.com/descope-dev/descope-cf-worker/assets/32936811/db891324-d389-41ce-bb02-a570a6f0cc60">

---

# Cloudflare Worker Sample App

This sample app is built to be deployed as a Cloudflare Worker, utilizing Cloudflare's edge computing capabilities to run serverless code. It is important to ensure that you have configured your Cloudflare account and domain correctly before proceeding with the installation and deployment of this worker.

If you want to learn more about Cloudflare Workers and how this sample app works behind the scenes, you can read our [published blog](https://www.descope.com/blog/post/session-management-cloudflare-workers) about Descope and Cloudflare Workers.

## Table of Contents 📝

1. [Preparation](#preparation)
2. [Configuration](#configuration)
3. [Deployment](#deployment)
4. [Contributing](#contributing)
5. [Issue Reporting](#issue-reporting)
6. [License](#license)

## Preparation 🛠️

Before you configure your Cloudflare Worker, you need to:

1. Sign up for a Cloudflare account and configure your domain.
2. Install the `wrangler` CLI tool:

```bash
npm install -g @cloudflare/wrangler
```

3. Authenticate `wrangler` with your Cloudflare account:

```bash
wrangler login
```

## Configuration 🔧

To set up your Cloudflare Worker, follow these steps:

1. Clone the repository to your local machine.
2. Install the project dependencies:

```bash
yarn install
```

3. Make sure that your Cloudflare account ID is correctly entered into the `wrangler.toml` file.
4. The script should already contain the necessary environment variables, such as `BASE_URL`. Verify that these are correct.

## Deployment 🚀

Deploy your Worker to Cloudflare by running:

```bash
wrangler publish
```

## Contributing 🤝

If you'd like to contribute to the development of this Cloudflare Worker, please follow the standard fork-and-pull-request workflow. Don't forget to update tests as appropriate.

## Issue Reporting ⚠️

For any issues or suggestions, feel free to open an issue in the GitHub repository.

## License 📜

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Please note that you will need to replace the placeholders like repository URL and any specific details about the worker functionality as needed. Also, ensure that the actual `LICENSE` file exists in your repository if you are going to reference it.
