import { generatePdf, downloadBlob } from './generate.js'

console.log('lscache', lscache)

lscache.setExpiryMilliseconds(3600000)

export function init() {
    console.log('init...')

    const forms = lscache.get('forms') || {}
    const current = lscache.get('current') || {}


    const data = {
        forms, current
    }

    this.now(data)

    console.log('init... OK', data)

    return data

}

export function now(data) {
    const _datetime = new Date()

    console.log(_datetime.toLocaleString())

    const date = [
        _datetime.getFullYear(),
        `${_datetime.getMonth() + 1}`.padStart(2, '0'),
        `${_datetime.getDate()}`.padStart(2, '0')
    ].join('-')

    const time = [
        `${_datetime.getHours()}`.padStart(2, '0'),
        `${_datetime.getMinutes()}`.padStart(2, '0')
    ].join(':')

    data.time = time
    data.date = date
}

export function reset(data) {
    console.log(this, data)

    data.forms[data.current.id] = data.current

    data.current = {
    }
    save(data)

}

export function save(data) {
    console.log('save...', data)

    const { current, forms } = data

    Object.entries(forms).forEach(([k, i]) => k !== i.id && (delete forms[k]))

    if (current.nom && current.prenom) {
        data.current.id = `${data.current.prenom}${data.current.nom}`
        const currentId = _formId(data.current)
        data.forms[currentId] = data.current

        lscache.set('current', data.current, 24 * 2)
    }

    lscache.set('forms', data.forms, 24 * 15)
    console.log('save... OK', current, Object.keys(forms))
}

function _formId(form) {
    const id = form.prenom + form.nom
    form.id = id
    return id
}

export async function generate({
    current: {
        nom, prenom,
        dateDeNaissance, lieuxDeNaissance,
        adresse, ville, codePostal
    },
    date,
    time }) {

    const profile = {
        lastname: nom,
        firstname: prenom,
        birthday: new Date(dateDeNaissance).toLocaleDateString(),
        lieunaissance: lieuxDeNaissance,
        address: adresse,
        zipcode: codePostal,
        town: ville,
        datesortie: new Date(date).toLocaleDateString(),
        heuresortie: time
    }

    const reasons =
        Array.from(document.getElementsByName('field-reason'))
            .filter(e => e.checked)
            .map(e => e.value)
            .join('-')


    const pdfBlob = await generatePdf(profile, reasons)
    downloadBlob(pdfBlob, 'attestation.pdf')

    // dateDeNaissance = new Date(dateDeNaissance).toLocaleDateString()

    // window.open(
    //     `https://attestation.bmagic.fr/?lastname=${nom}&firstname=${prenom}}&birthday=${dateDeNaissance}&lieunaissance=${lieuxDeNaissance}&address=${adresse}&zipcode=${codePostal}&town=${ville}&fakedate=false`
    // )
}

export function remove(data, id) {

    delete data.forms[id]
    console.log('remove', id, JSON.stringify(data.forms))
    this.save(data)
}

export function load(data, id) {
    if (!data.forms[id]) {
        this.save(data)
        return
    }
    data.current = Object.assign({}, data.forms[id])

}