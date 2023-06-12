import { Gist, GistUri } from "../../src/util.js";

type ProcessGistHtmlParams = {
  uri: GistUri,
  gist: Gist,
};
export const singleFileGist: ProcessGistHtmlParams = {
  uri: {
    username: `darylwright`,
    gistId: `75332f27a6e9bff70bc0406114570829`,
    file: `gist-test.ts`,
    lines: [],
    highlights: [],
  },
  gist: {
    div: `<div id="gist122750024" class="gist">
  <div class="gist-file" translate="no">
    <div class="gist-data">
      <div class="js-gist-file-update-container js-task-list-container file-box">
        <div id="file-gist-test-ts" class="file my-2">
          <div itemprop="text" class="Box-body p-0 blob-wrapper data type-typescript  ">
            <div class="js-check-bidi js-blob-code-container blob-code-content">
              <template class="js-file-alert-template">
                <div data-view-component="true" class="flash flash-warn flash-full d-flex flex-items-center">
                  <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16"
                       data-view-component="true" class="octicon octicon-alert">
                    <path
                      d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path>
                  </svg>
                  <span>      This file contains bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.      <a
                    href="https://github.co/hiddenchars" target="_blank">Learn more about bidirectional Unicode characters</a>    </span>
                  <div data-view-component="true" class="flash-action"><a href="{{ revealButtonHref }}"
                                                                          data-view-component="true" class="btn-sm btn">
                    Show hidden characters</a></div>
                </div>
              </template>
              <template class="js-line-alert-template"><span aria-label="This line has hidden Unicode characters"
                                                             data-view-component="true"
                                                             class="line-alert tooltipped tooltipped-e">    <svg
                aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" data-view-component="true"
                class="octicon octicon-alert">    <path
                d="M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"></path></svg></span>
              </template>
              <table data-hpc class="highlight tab-size js-file-line-container js-code-nav-container js-tagsearch-file"
                     data-tab-size="8" data-paste-markdown-skip data-tagsearch-lang="TypeScript"
                     data-tagsearch-path="gist-test.ts">
                <tr>
                  <td id="file-gist-test-ts-L1" class="blob-num js-line-number js-code-nav-line-number js-blob-rnum"
                      data-line-number="1"></td>
                  <td id="file-gist-test-ts-LC1" class="blob-code blob-code-inner js-file-line"><span
                    class=pl-k>export</span> <span class=pl-k>default</span> <span class=pl-k>function</span> <span
                    class=pl-en>compare</span><span class=pl-c1>&lt;</span><span class=pl-smi>T</span><span class=pl-c1>&gt;</span><span
                    class=pl-kos>(</span><span class=pl-s1>a0</span>: <span class=pl-smi>T</span><span
                    class=pl-kos>,</span> <span class=pl-s1>b0</span>: <span class=pl-smi>T</span><span
                    class=pl-kos>)</span>: <span class=pl-smi>number</span> <span class=pl-kos>{</span></td>
                </tr>
                <tr>
                  <td id="file-gist-test-ts-L2" class="blob-num js-line-number js-code-nav-line-number js-blob-rnum"
                      data-line-number="2"></td>
                  <td id="file-gist-test-ts-LC2" class="blob-code blob-code-inner js-file-line"><span
                    class=pl-k>if</span> <span class=pl-kos>(</span><span class=pl-s1>a0</span> <span
                    class=pl-c1>===</span> <span class=pl-s1>b0</span><span class=pl-kos>)</span> <span class=pl-k>return</span>
                    <span class=pl-c1>0</span><span class=pl-kos>;</span></td>
                </tr>
                <tr>
                  <td id="file-gist-test-ts-L3" class="blob-num js-line-number js-code-nav-line-number js-blob-rnum"
                      data-line-number="3"></td>
                  <td id="file-gist-test-ts-LC3" class="blob-code blob-code-inner js-file-line"><span
                    class=pl-k>if</span> <span class=pl-kos>(</span><span class=pl-s1>a0</span> <span
                    class=pl-c1>&gt;</span> <span class=pl-s1>b0</span><span class=pl-kos>)</span> <span class=pl-k>return</span>
                    <span class=pl-c1>1</span><span class=pl-kos>;</span></td>
                </tr>
                <tr>
                  <td id="file-gist-test-ts-L4" class="blob-num js-line-number js-code-nav-line-number js-blob-rnum"
                      data-line-number="4"></td>
                  <td id="file-gist-test-ts-LC4" class="blob-code blob-code-inner js-file-line"><span
                    class=pl-k>return</span> <span class=pl-c1>-</span><span class=pl-c1>1</span><span
                    class=pl-kos>;</span></td>
                </tr>
                <tr>
                  <td id="file-gist-test-ts-L5" class="blob-num js-line-number js-code-nav-line-number js-blob-rnum"
                      data-line-number="5"></td>
                  <td id="file-gist-test-ts-LC5" class="blob-code blob-code-inner js-file-line"><span
                    class=pl-kos>}</span></td>
                </tr>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="gist-meta"><a
      href="https://gist.github.com/darylwright/75332f27a6e9bff70bc0406114570829/raw/56ae74d7dda80005ce853ba2307ef15abf3b7e99/gist-test.ts"
      style="float:right">view raw</a> <a
      href="https://gist.github.com/darylwright/75332f27a6e9bff70bc0406114570829#file-gist-test-ts"> gist-test.ts </a>
      hosted with &#10084; by <a href="https://github.com">GitHub</a></div>
  </div>
</div>
`,
    description: `This is an example code snippet used for test data`,
    public: false,
    created_at: `2023-06-01T09:50:34.000-03:00`,
    files: [`gist-test.ts`],
    owner: `darylwright`,
    stylesheet: `https://github.githubassets.com/assets/gist-embed-cdd2b47f37c5.css`,
  },
};
