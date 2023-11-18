import $ from 'jquery';
import { get } from "lodash/fp";
import CodeMirror from "codemirror";
import {
    JupyterFrontEnd,
    JupyterFrontEndPlugin,
} from "@jupyterlab/application";
import { ISettingRegistry } from '@jupyterlab/settingregistry';
import { INotebookTracker, NotebookActions } from "@jupyterlab/notebook";

const PLUGIN_ID = "@oselivanov/jupyterlab-gen-ai:plugin";


const handleActivation = (app: JupyterFrontEnd, tracker: INotebookTracker, settings: ISettingRegistry) => {
    let request_url = '';
    let request_template_string = '';

    function loadSetting(setting: ISettingRegistry.ISettings): void {
        // Read the settings and convert to the correct type
        request_url = setting.get('request_url').composite as string;
        request_template_string = setting.get('request_template').composite as string;

        console.log(
          `Settings Example extension: request_url is set to '${request_url}'`
        );
    }

    const generateInANewCell = (tracker: INotebookTracker) => (args: any) => {
        const widget = tracker.currentWidget;
        if (!widget) return;
        const notebook = widget.content;

        // @ts-ignore
        //widget.content.mode = 'edit';

        const this_cm = get("content.activeCell.editor.doc", widget) as CodeMirror.Doc;
        if (!this_cm) return;
        const text = this_cm.getValue()

        NotebookActions.insertBelow(notebook);

        // @ts-ignore
        //widget.content.mode = 'edit';

        const next_cm = get("content.activeCell.editor.doc", widget) as CodeMirror.Doc;
        if (!next_cm) return;

        let request_object = JSON.parse(request_template_string);
        request_object.messages[1].content = text;
        const request_json_string = JSON.stringify(request_object);
        var last_response_len = false;

        // @ts-ignore
        $.ajax({
          url: request_url,
          contentType: 'application/json',
          data: request_json_string,
          dataType: 'json',
          processData: false,
          type: 'POST',
          xhrFields: {
            onprogress: function(e: any) {
              var this_response, response = e.currentTarget.response;
              if(last_response_len === false) {
                this_response = response;
                last_response_len = response.length;
              } else {
                this_response = response.substring(last_response_len);
                last_response_len = response.length;
              }

              var lines = this_response.split('\n')
              for (var i in lines) {
                var line = lines[i];
                if (!line.startsWith('data: ')) continue;

                var out = line.slice(6);
                if(out.trim() == '[DONE]') return;

                var d = JSON.parse(out);
                if (!d.choices[0].delta.content) continue;

                var token = d.choices[0].delta.content;

                // @ts-ignore
                next_cm.replaceRange(token, {line: Infinity});
              }
            }
          }
        });
    };

    Promise.all([app.restored, settings.load(PLUGIN_ID)])
      .then(([, setting]) => {
        // Read the settings
        loadSetting(setting);

        app.commands.addCommand("jupyterlab-gen-ai:generate-in-a-new-cell", {
            label: "Generate in a new cell",
            execute: generateInANewCell(tracker),
        });
      })
};

const extension: JupyterFrontEndPlugin<void> = {
    id: PLUGIN_ID,
    autoStart: true,
    requires: [INotebookTracker, ISettingRegistry],
    activate: handleActivation,
};

export default extension;
