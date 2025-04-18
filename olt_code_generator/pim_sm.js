const regexObjName = "U9716H_REGEX"
const cmdList = []
const coreCmd = 'ip pim'
const data = {
    "name": "PIM_SM",
    "add_fields": {
        "pim_enable_yn": "Y",
        "jp_timer": "1",
        "anycast_rp": [
            {
                "anycast_rp": "1.1.1.1"
            },
            {
                "anycast_rp": "1.1.1.2"
            }
        ],
        "rp_register_kat": "2",
        "sparse_mode": "123",
        "ignore_rp_set_priority_yn": "Y",
        "log_neighbor_changes_yn": "Y",
        "register_rate_limit": "3",
        "register_rp_reachability_yn": "Y",
        "register_suppression": "4",
        "register_source": "1.1.1.3",
        "cisco_register_checksum_group_list": "5",
        "crp_cisco_prefix_yn": "Y"
    },
    "delete_fields": {
        "jp_timer": "1",
        "anycast_rp": [],
        "rp_register_kat": "2",
        "register_rate_limit": "3",
        "register_suppression": "4",
        "register_source": "1.1.1.3",
        "cisco_register_checksum_group_list": "5",
    },
    "interface_list": [
        {
            "add_fields": {
                "bsr_border_yn": "Y",
                "dr_priority": "12",
                "hello_interval": "13",
                "hello_hold_time": "14",
                "neighbor_filter": "15",
                "propagation_delay": "2000",
                "unicast_bsm_yn": "Y"
            },
            "delete_fields": {
                "dr_priority": "12",
                "hello_interval": "13",
                "hello_hold_time": "14",
                "neighbor_filter": "15",
                "propagation_delay": "2000"
            },
            "interface": "Vlan700"
        }
    ]
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

// for (const [key, val] of Object.entries(data.add_fields)) {
for (const [key, val] of Object.entries(data.interface_list[0].add_fields)) {
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
