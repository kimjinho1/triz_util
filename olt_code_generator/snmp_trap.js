const regexObjName = "U9716H_REGEX"
const cmdList = []
const coreCmd = 'snmp-server enable traps'
const data = {
    "name": "SNMP",
    "add_fields": {
        "snmp_server_trap_snmp": [
            {
                "snmp": "authFail"
            },
            {
                "snmp": "coldStart"
            },
            {
                "snmp": "warmStart"
            }
        ],
        "snmp_server_traps_bgp": "Y",
        "snmp_server_traps_cpu_rx_queue_drop": "Y",
        "snmp_server_traps_envmon": [
            {
                "snmp_server_traps_envmon": "fan"
            },
            {
                "snmp_server_traps_envmon": "text-supply"
            },
            {
                "snmp_server_traps_envmon": "temperature"
            },
            {
                "snmp_server_traps_envmon": "supply"
            }
        ],
        "snmp_server_traps_interface": "Y",
        "snmp_server_traps_resource": "cpu-load-monitor",
        "snmp_server_traps_traffic_control": "Y",
        "snmp_server_traps_traffic_monitoring": "Y",
        "snmp_server_traps_traffic_vlancreate": "Y",
        "snmp_server_traps_traffic_vlandelete": "Y"
    },
    "delete_fields": {
        "snmp_server_trap_snmp": [
            {
                "snmp": "authFail"
            },
            {
                "snmp": "coldStart"
            },
            {
                "snmp": "warmStart"
            }
        ],
        "snmp_server_traps_envmon": [
            {
                "snmp_server_traps_envmon": "fan"
            },
            {
                "snmp_server_traps_envmon": "text-supply"
            },
            {
                "snmp_server_traps_envmon": "temperature"
            },
            {
                "snmp_server_traps_envmon": "supply"
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
