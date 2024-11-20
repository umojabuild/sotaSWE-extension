import { CostIcon } from 'components/cost-icon';
import { RequestViewItem } from 'components/exchange/request';
import { ResponseViewItem } from 'components/exchange/response';
import resolveEditorContent from 'components/input/resolveInput';
import Tiptap from 'components/input/TipTapEditor';
import { TaskDD, TaskDL, TaskDT } from 'components/task-definition-list';
import { UsageList } from 'components/usage-list';
import * as React from 'react';
import { Navigate } from 'react-router-dom';
import { useSubmenuContext } from 'store/submenuContext';
import { cn } from 'utils/cn';
import { Exchange, View } from '../../model';
import ClaudeLogo from '../assets/claude.svg';
import { useTask } from './use-task';

export function TaskView() {
  const task = useTask();
  const [summaryShown, setSummaryShown] = React.useState(false);
  const availableContextProviders = useSubmenuContext((state) => state.contextProviderDescriptions);

  if (task.data === undefined) {
    return <div>Loading...</div>;
  }

  if (!task.data.task || !task.data.task.preset) {
    return <Navigate to={`/${View.Preset}`} />;
  }

  const { exchanges, preset, cost, usage, query } = task.data.task;
  const isQueryEmpty = query === '';
  const showUsage = Object.keys(usage).length > 0;

  return (
    <main className="flex h-full flex-col">
      <header className="sticky top-0 z-10 p-2">
        <div
          className="group relative cursor-pointer"
          onClick={() => setSummaryShown(!summaryShown)}
        >
          <div className="absolute -inset-2 -z-10 rounded-sm bg-panel-background transition-all group-hover:brightness-125" />
          <h2 className={cn(isQueryEmpty && 'text-base text-description')}>
            {isQueryEmpty ? 'New request' : query}
          </h2>
          {!summaryShown && (
            <dl className="mt-1 flex items-baseline">
              <dt className="sr-only">Preset</dt>
              <dd className="mr-auto flex items-center text-description">
                <ClaudeLogo width={12} height={12} className="mr-1" />
                <span className="whitespace-nowrap">{preset.name}</span>
              </dd>
              {/* {cost && (
                <React.Fragment>
                  <dt className="sr-only">API cost</dt>
                  <dd>
                    <span>{cost}$</span>
                  </dd>
                </React.Fragment>
              )} */}
            </dl>
          )}
        </div>
        {summaryShown && (
          <TaskDL className="mt-4">
            <TaskDT>Query</TaskDT>
            <TaskDD className={cn(isQueryEmpty && 'No')}>
              {isQueryEmpty ? 'No query made yet' : query}
            </TaskDD>
            <TaskDT>Preset</TaskDT>
            <TaskDD>
              <span className="flex gap-1">
                <ClaudeLogo className="h-3 w-3 flex-shrink-0 translate-y-0.5" /> {preset.name}
              </span>
            </TaskDD>
            {/* <React.Fragment>
              <TaskDT>API cost</TaskDT>
              <TaskDD className="flex gap-1">
                <CostIcon className="translate-y-0.5" />
                {cost}$
              </TaskDD>
            </React.Fragment>
            {showUsage && (
              <React.Fragment>
                <TaskDT>Data</TaskDT>
                <TaskDD className="mt-1">
                  <UsageList usage={usage} />
                </TaskDD>
              </React.Fragment>
            )} */}
          </TaskDL>
        )}
      </header>
      <div className="flex flex-grow flex-col gap-2">
        <section className="flex-grow p-2">
          {exchanges && (
            <ol>
              {exchanges.map((exchange) => (
                <li key={exchange.exchangeId}>{renderExchange(exchange)}</li>
              ))}
            </ol>
          )}
        </section>
        <div className="sticky bottom-0 p-2">
          <Tiptap
            availableContextProviders={availableContextProviders ?? []}
            historyKey="chat"
            onEnter={async (editorState) => {
              const sessionId = task.data?.task.sessionId;
              if (sessionId === undefined) {
                return;
              }

              const [selectedContextItems, _, content] = await resolveEditorContent(editorState);
              const inputQuery = Array.isArray(content)
                ? content.map((c) => c.text).join('\n')
                : content;

              task.sendRequest(inputQuery, sessionId, selectedContextItems);

              // Clear the editor after sending
              editorState.editor.commands.clearContent();
            }}
          />
        </div>
      </div>
    </main>
  );
}

function renderExchange(exchange: Exchange) {
  switch (exchange.type) {
    case 'request':
      return <RequestViewItem {...exchange} />;
    case 'response':
      return <ResponseViewItem {...exchange} />;
  }
}
