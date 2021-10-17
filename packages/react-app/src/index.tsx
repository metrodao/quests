// @ts-ignore
import ReactDOM from 'react-dom';
import App from './app';
import { SubgraphProvider } from './providers/subgraph';
import './style.scss';

ReactDOM.render(
  <SubgraphProvider>
    <App />
  </SubgraphProvider>,
  document.getElementById('root'),
);