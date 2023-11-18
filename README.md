# JupyterLab 3.x Notebook GenAI integration extension

This thing uses local [web server comes with llama-cpp-python](https://llama-cpp-python.readthedocs.io/en/latest/server/) to answer question and generate code right inside of the Jupyter Notebook, making new cells.

This version is not registered as jupyter extension yet.

# Requirements

- [JupyterLab 3.x](https://jupyterlab.readthedocs.io/en/3.6.x/index.html)
- [node 12+](https://nodejs.org)

# Installation

1. Install the extension

git clone https://github.com/oselivanov/jupyterlab-gen-ai.git
jupyter labextension install jupyterlab-gen-ai

2. Get [llama-cpp-python server](https://llama-cpp-python.readthedocs.io/en/latest/server/) up and running with any model you like: I used mistral-7b-instruct-v0.1.Q4_K_M.gguf in the following commands.

    pip3 install llama-cpp-python[server]
    python3 -m llama_cpp.server --n_gpu_layers 0 --n_threads 4 --model models/mistral-7b-instruct-v0.1.Q4_K_M.gguf

**Note:** Don't forget to fix --n_gpu_layers and --n_threads

3. Use cmd+shift+enter, it takes current cell content to GenAI, creates a new cell of the same type below and live feeds the response to this new cell.

# TODO

1. Add support for headers, so one could use it with OpenAI
2. Pass notebook contents as a context
3. From a list of urls, fetch them and add it to the context
4. Port it to Jupyterlab 4

# Inspirations

* https://github.com/henshinger/gpt-jupyterlab
* https://github.com/jupyterlab/jupyter-ai

Both I found too complex for my quick experiments :)

Thanks too the following extensions for code examples:

* https://github.com/jupyterlab-contrib/jupyterlab-vim
* https://github.com/jupyterlab/extension-examples
* https://github.com/techrah/jupyterext-text-shortcuts
