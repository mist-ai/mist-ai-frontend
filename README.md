# Mist AI Frontend

This is the frontend repository for the Mist AI project. The Mist AI project aims to provide intelligent solutions for various applications using machine learning and artificial intelligence.

## Table of Contents

- [Setting Environment](#setting-environment)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Setting Environment

To set the environment create a `.env` file on the root folder and add following:

```bash
VITE_LETTA_AGENT_ID={Agent_ID}
VITE_LETTA_SERVER_BASE_URL={Letta_Server_Base_URL}
```

Note: When running locally set the Letta_Server_Base_URL as `http://localhost:8283/v1`

## Installation

To install the dependencies for this project, run the following command:

```bash
pnpm install
```

## Usage

To start the development server, run:

```bash
pnpm run dev
```

This will start the application on `http://localhost:5173`.

## Contributing

We welcome contributions to the Mist AI Frontend project. To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Create a new Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
