import { Request } from '../../../model';
import { ContextSummary } from '../context-summary';
import { Exchange, ExchangeHeader, ExchangeContent } from './exchange-base';

export function RequestViewItem(props: Request) {
  const { username, message, context } = props;
  return (
    <Exchange className="my-8 first:mt-0">
      <ExchangeHeader>{username}</ExchangeHeader>
      <ExchangeContent>
        <p>{message}</p>
        {context.length > 0 && <ContextSummary context={context} />}
      </ExchangeContent>
    </Exchange>
  );
}
