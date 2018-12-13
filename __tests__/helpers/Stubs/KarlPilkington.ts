import City from './City';
import Manchester from './Manchester';

class KarlPilkington {

    /**
     * Where he was born.
     *
     * @var {City}
     */
    private _placeOfBirth: City;

    /**
     * When he was born.
     *
     * @var {Date}
     */
    private _dateOfBirth: Date;

    /**
     * His nick name.
     *
     * @var {string}
     */
    private _nickName: string;

    /**
     * Create a new instance.
     *
     * @constructor
     * @param {City} placeOfBirth
     * @param {Date} dateOfBirth
     * @param {string} nickName
     */
    public constructor(
        placeOfBirth: Manchester,
        dateOfBirth: Date = new Date('1972-09-23'),
        nickName: string = 'Karlie Pilkboys'
    ) {
        this._placeOfBirth = placeOfBirth;
        this._dateOfBirth = dateOfBirth;
        this._nickName = nickName;
    }

    /**
     * Greet someone in Karl fashion.
     *
     * @param {string} name
     * @returns {string}
     */
    public greet(name: string): string {
        return `Alrite ${name}?`;
    }

    /**
     * Get Karl's place of birth.
     *
     * @returns {City}
     */
    public get placeOfBirth(): City {
        return this._placeOfBirth;
    }

    /**
     * Get Karl's nick name.
     *
     * @returns {string}
     */
    public get nickName(): string {
        return this._nickName;
    }

}

export default KarlPilkington;
