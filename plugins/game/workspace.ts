import { defineComponent, html } from "@pathmx/core"

const tabs = ["Notes", "Materials", "Tasks", "Visuals", "Dr.Bos"]
export const Workspace = defineComponent({
  tag: "bubu:workspace",
  client: new URL("./workspace-client.ts", import.meta.url),
  render(_use, _compiled, { view }) {
    return html`
      <section
        class="project-workspace"
        data-workspace
        data-actor="${view.principal.type === "actor"
          ? view.principal.actor
          : "guest"}"
        data-pmx-prose="off"
      >
        <header class="workspace-heading"><h1>Project workspace</h1></header>
        <div class="workspace-columns">
          <aside class="workspace-sidebar">
            <label for="project-kind">Project space</label>
            <select id="project-kind" data-kind>
              <option value="student">My project</option>
              <option value="community">Community project</option>
            </select>
            <p data-kind-description></p>
            <a
              href="https://ready-hub-viethope.netlify.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Explore the community hub ↗
            </a>
            <p class="workspace-muted">
              Community cases and discussions live on the hub. This draft is
              local; shared editing is not connected.
            </p>
          </aside>
          <div class="workspace-paper">
            <label for="project-title">Project name</label>
            <input
              id="project-title"
              data-field="title"
              maxlength="120"
              placeholder="Project name"
            />
            <p class="workspace-muted">
              Drafts save in this browser for the selected learner. Guest drafts
              are shared on this browser. Export a copy to keep or share.
            </p>
            <div
              class="workspace-tabs"
              role="tablist"
              aria-label="Project materials"
            >
              ${tabs.map(
                (tab, i) => html`
                  <button
                    type="button"
                    role="tab"
                    id="workspace-tab-${i}"
                    aria-controls="workspace-panel-${i}"
                    aria-selected="${i === 0}"
                    tabindex="${i === 0 ? 0 : -1}"
                    data-tab="${i}"
                  >
                    ${tab}
                  </button>
                `,
              )}
            </div>
            <section
              role="tabpanel"
              id="workspace-panel-0"
              aria-labelledby="workspace-tab-0"
              tabindex="0"
              data-panel="0"
            >
              <label for="project-notes">Ideas & notes</label>
              <textarea
                id="project-notes"
                data-field="notes"
                rows="10"
                maxlength="20000"
                placeholder="Project notes"
              ></textarea>
            </section>
            <section
              role="tabpanel"
              id="workspace-panel-1"
              aria-labelledby="workspace-tab-1"
              tabindex="0"
              data-panel="1"
              hidden
            >
              <label for="project-materials">Links, sources & takeaways</label>
              <textarea
                id="project-materials"
                data-field="materials"
                rows="9"
                maxlength="20000"
                placeholder="Paste resource links and add a note about why each one matters."
              ></textarea>
              <p>
                Keep files in your team's shared drive and collect their links
                here.
              </p>
            </section>
            <section
              role="tabpanel"
              id="workspace-panel-2"
              aria-labelledby="workspace-tab-2"
              tabindex="0"
              data-panel="2"
              hidden
            >
              <p>
                Write an action, owner, and date on each line. These tasks also
                become your flowchart.
              </p>
              <label for="project-tasks">
                Project tasks (one per line, up to 12)
              </label>
              <textarea
                id="project-tasks"
                data-field="tasks"
                rows="8"
                maxlength="4000"
                placeholder="Research the idea — owner — date"
              ></textarea>
              <div data-task-list></div>
            </section>
            <section
              role="tabpanel"
              id="workspace-panel-3"
              aria-labelledby="workspace-tab-3"
              tabindex="0"
              data-panel="3"
              hidden
            >
              <h3>Task flowchart</h3>
              <p>
                Tasks connect in the order you wrote them. Select a step to
                inspect it.
              </p>
              <div class="workspace-flow" data-flow></div>
              <p data-flow-detail role="status"></p>
              <h3>Resource allocation · Sankey diagram</h3>
              <p>
                Explore a single pool split across three uses. Enter your own
                labels and amounts in the same unit; these are planning values,
                not a wallet.
              </p>
              <div class="workspace-allocations">
                ${[0, 1, 2].map(
                  (i) => html`
                    <div>
                      <label for="allocation-label-${i}">Use ${i + 1}</label>
                      <input
                        id="allocation-label-${i}"
                        data-field="label${i}"
                        maxlength="40"
                        placeholder="Name a use"
                      />
                      <label for="allocation-value-${i}">Amount ${i + 1}</label>
                      <input
                        id="allocation-value-${i}"
                        data-field="value${i}"
                        type="number"
                        min="0"
                        max="1000000000"
                        step="any"
                        placeholder="0"
                      />
                    </div>
                  `,
                )}
              </div>
              <div data-sankey></div>
              <p data-allocation-detail role="status"></p>
            </section>
            <section
              role="tabpanel"
              id="workspace-panel-4"
              aria-labelledby="workspace-tab-4"
              tabindex="0"
              data-panel="4"
              hidden
            >
              <p>
                Prepare a question from your project name, notes, and tasks.
                Review it before sending it in chat.
              </p>
              <button type="button" data-prepare>
                Prepare a step-by-step advice request
              </button>
              <label for="project-question">Your question</label>
              <textarea
                id="project-question"
                data-field="question"
                rows="7"
                maxlength="2000"
                placeholder="Ask a project question"
              ></textarea>
              <p>
                Copy your question, then open chat. AI replies require sign-in
                and a configured provider.
              </p>
              <a
                class="primary-action"
                href="/dr-boss.page"
                data-pmx-source-open="overlay"
              >
                Ask Dr.Bos →
              </a>
            </section>
            <footer class="workspace-footer">
              <span role="status" data-save-status></span>
              <button type="button" data-export>Export project notes</button>
            </footer>
          </div>
        </div>
      </section>
    `
  },
})
