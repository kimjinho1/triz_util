const regexObjName = "U9716H_REGEX"
const cmdList = []
const coreCmd = 'snmp-server'
const data = {
    "name": "SNMP",
    "add_fields": {
        "enable_yn": "Y",
        "snmp_server_group": [
            {
                "group": "123",
                "version": "v3",
                "version_type": "priv",
                "read_write": "read"
            },
            {
                "group": "12",
                "version": "v2c",
                "version_type": "",
                "read_write": "write"
            }
        ],
        "snmp_server_host": [
            {
                "ip_addr": "1.1.1.2",
                "type": "inform",
                "version": "v1",
                "version_type": "",
                "word": "test",
                "host_port": "2"
            },
            {
                "ip_addr": "2.2.2.2",
                "type": "trap",
                "version": "v3",
                "version_type": "auth",
                "word": "test2",
                "host_port": "1"
            }
        ],
        "snmp_server_agentx_retry": "1",
        "snmp_server_agentx_timeout": "2",
        "community_name": "effe",
        "community_type": "read-only",
        "snmp_server_location": "location1",
        "snmp_server_contact": "contact"
    },
    "delete_fields": {
        "snmp_server_agentx_retry": false,
        "snmp_server_agentx_timeout": false,
        "snmp_server_group": [
            {
                "group": "123",
                "version": "v3",
                "version_type": "priv",
                "read_write": "read"
            },
            {
                "group": "12",
                "version": "v2c",
                "version_type": "",
                "read_write": "write"
            }
        ],
        "community_name": false,
        "community_type": false,
        "snmp_server_location": false,
        "snmp_server_contact": false,
        "snmp_server_host": [
            {
                "ip_addr": "1.1.1.2",
                "type": "inform",
                "version": "v1",
                "version_type": "",
                "word": "test",
                "host_port": "2"
            },
            {
                "ip_addr": "2.2.2.2",
                "type": "trap",
                "version": "v3",
                "version_type": "auth",
                "word": "test2",
                "host_port": "1"
            }
        ]
    },
}

if (data.delete_fields) {
    const deleteVarKeys = Object.keys(data.delete_fields);
    cmdList.push('if (!lo.isEmpty(delete_fields)) {')
    const varInitCode = `\tconst {\n\t\t${deleteVarKeys.join(',\n\t\t')}\n\t} = delete_fields\n`;
    cmdList.push(varInitCode)
    for ([key, val] of Object.entries(data.delete_fields)) {
        const subCmd = key.replaceAll('_yn', '').replaceAll('_', '-')
        cmdList.push(
            `\tif (${key} === false) \{`,
            `\t\tcommands.push(\`no ${coreCmd} ${subCmd}\`)`,
            '\t\}'
        )
    }
    cmdList.push('\}\n')
}

if (data.add_fields) {
    const addVarKeys = Object.keys(data.add_fields);
    cmdList.push('if (!lo.isEmpty(add_fields)) {')
    const varInitCode = `\tconst {\n\t\t${addVarKeys.join(',\n\t\t')}\n\t} = add_fields\n`;
    cmdList.push(varInitCode)
    for ([key, val] of Object.entries(data.add_fields)) {
        let cmd
        let subCmd
        if (val === 'Y' || val === 'N') {
            subCmd = key.replaceAll('_yn', '').replaceAll('_', '-')
            cmdList.push(
                `\tif (${key} === 'Y') \{`,
                `\t\tcommands.push(\`${coreCmd} ${subCmd}\`)`,
                `\t} else if (${key} === 'N') \{`,
                `\t\tcommands.push(\`no ${coreCmd} ${subCmd}\`)`,
                '\t}\n'
            )
        } else {
            subCmd = key.replaceAll('_yn', '').replaceAll('_', '-')
            cmdList.push(
                `\tif (${key}) \{`,
                `\t\tcommands.push(\`${coreCmd} ${subCmd} \$\{${key}\}\`)`,
                `\t} else \{`,
                `\t\tcommands.push(\`no ${coreCmd} ${subCmd}\`)`,
                '\t\}\n'
            )
        }
    }
    cmdList.push('\}\n')
}

if (data.interface_list) {
    data.interface_list.forEach(({ add_fields, delete_fields, interface }) => {
        if (delete_fields && delete_fields != {}) {
            const deleteVarKeys = Object.keys(delete_fields);
            cmdList.push('if (!lo.isEmpty(delete_fields)) {')
            const varInitCode = `\tconst {\n\t\t${deleteVarKeys.join(',\n\t\t')}\n\t} = delete_fields\n`;
            cmdList.push(varInitCode)
            for ([key, val] of Object.entries(delete_fields)) {
                const subCmd = key.replaceAll('_yn', '').replaceAll('_', '-')
                cmdList.push(
                    `\tif (${key} === false) \{`,
                    `\t\tcommands.push(\`no ${coreCmd} ${subCmd}\`)`,
                    '\t\}'
                )
            }
            cmdList.push('\}\n')
        }

        if (add_fields) {
            const addVarKeys = Object.keys(add_fields);
            cmdList.push('if (!lo.isEmpty(add_fields)) {')
            const varInitCode = `\tconst {\n\t\t${addVarKeys.join(',\n\t\t')}\n\t} = add_fields\n`;
            cmdList.push(varInitCode)
            for ([key, val] of Object.entries(add_fields)) {
                let cmd
                let subCmd
                if (val === 'Y' || val === 'N') {
                    subCmd = key.replaceAll('_yn', '').replaceAll('_', '-')
                    cmdList.push(
                        `\tif (${key} === 'Y') \{`,
                        `\t\tcommands.push(\`${coreCmd} ${subCmd}\`)`,
                        `\t} else if (${key} === 'N') \{`,
                        `\t\tcommands.push(\`no ${coreCmd} ${subCmd}\`)`,
                        '\t}\n'
                    )
                } else {
                    subCmd = key.replaceAll('_yn', '').replaceAll('_', '-')
                    cmdList.push(
                        `\tif (${key}) \{`,
                        `\t\tcommands.push(\`${coreCmd} ${subCmd} \$\{${key}\}\`)`,
                        `\t} else \{`,
                        `\t\tcommands.push(\`no ${coreCmd} ${subCmd}\`)`,
                        '\t\}\n'
                    )
                }
            }
            cmdList.push('\}\n')
        }
    })
}


// legacy-agent 최종 코드 생성
const cmdCode = cmdList ? '\n' + cmdList.join('\n') : ''
const legacyCode = `${cmdCode}`


// regex, result 코드
const regexList = [];
const resultList = [];
const regexCoreCmd = data.name.toUpperCase().replaceAll(' ', '_');
let isFirstCondition = true;

for (const [key, val] of Object.entries(data.add_fields)) {
    // for (const [key, val] of Object.entries(data.interface_list[0].add_fields)) {
    const regexKey = key.replaceAll('_yn', '').toUpperCase()
    const subCmd = key.replaceAll('_yn', '').replaceAll('_', '-');

    if (val === 'Y' || val === 'N') {
        regexList.push(
            `${regexCoreCmd}_${regexKey}_REGEX: /${coreCmd} ${subCmd}/,`
        );

        resultList.push(
            `${isFirstCondition ? 'if' : '} else if'} ((m = ${regexObjName}.${regexCoreCmd}_${regexKey}_REGEX.exec(splitArr[i]))) {`,
            `    result.${key} = "Y";`
        );
    } else {
        regexList.push(
            `${regexCoreCmd}_${regexKey}_REGEX: /${coreCmd} ${subCmd} (?<${key}>\\S+)/,`
        );

        resultList.push(
            `${isFirstCondition ? 'if' : '} else if'} ((m = ${regexObjName}.${regexCoreCmd}_${regexKey}_REGEX.exec(splitArr[i]))) {`,
            `    const { ${key} } = m.groups;`,
            `    result.${key} = ${key};`,
        );
    }

    // 첫 번째 조건 이후로는 else if로 전환
    isFirstCondition = false;
}
resultList.push("\}")

// regex 최종 코드
const regexCode = regexList.join('\n');
// result 최종 코드
const resultCode = resultList.join('\n');


console.log("\n===============================================================")
console.log("=============================================================== legacy-agent")
console.log("===============================================================\n")
console.log(legacyCode)
console.log("\n===============================================================")
console.log("=============================================================== regex")
console.log("===============================================================\n")
console.log(regexCode);
console.log("\n===============================================================")
console.log("=============================================================== result")
console.log("===============================================================\n")
console.log(resultCode);
