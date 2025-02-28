module.exports.runtime = {
    handler: async function (parameters) {
        const callerId = `${this.config.name}-v${this.config.version}`;
        try {
            this.introspect(`${callerId} called with ${JSON.stringify(parameters)}...`);
            
            // 从 plugin.json 的 setup_args 中获取 API Key
            const apiKey = this.config.setup_args.drugbank_api_key.value;

            // 检查 API Key 是否存在
            if (!apiKey || apiKey === "YOUR openFDA API Key") {
                throw new Error("API Key is missing or invalid. Please configure it in the plugin settings.");
            }

            // 构建请求 URL
            const apiUrl = `https://api.fda.gov/drug/drugsfda.json?limit=1&api_key=${apiKey}`;

            // 发起 GET 请求
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // 处理返回的数据
            const results = data.results || [];
            const totalRecords = results.length || 0;

            return JSON.stringify({
                results,
                totalRecords
            });

        } catch (e) {
            this.introspect(`${callerId} failed to invoke with ${JSON.stringify(parameters)}. Reason: ${e.message}`);
            this.logger(`${callerId} failed to invoke with ${JSON.stringify(parameters)}`, e.message);
            return `The tool failed to run for some reason. Here is all we know: ${e.message}`;
        }
    },
    
    // 可以加载的外部调用功能
    _doExternalApiCall : async (myProp) => {
        const _ScopedExternalCaller = require('./external-api-caller.js');
        return await _ScopedExternalCaller.doSomething(myProp);
    }
};