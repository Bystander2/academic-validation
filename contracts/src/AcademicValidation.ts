import { Field, method, SmartContract, State, state, UInt32 } from "o1js";

export class AcademicValidation extends SmartContract {
    // 存储论文的原创性（原创值），使用0或1标记是否原创
    @state(Field) originality = State<Field>();
    // 存储论文的总评分
    @state(UInt32) totalScore = State<UInt32>();
    // 存储论文的平均评分
    @state(UInt32) averageScore = State<UInt32>();
    // 存储评分次数
    @state(UInt32) scoreCount = State<UInt32>();
    

    // 初始化论文原创性（假设是原创）并初始化评分
    init() {
        super.init();
        this.originality.set(Field(1));  // 初始为原创
        this.totalScore.set(UInt32.from(0));  // 初始评分总和为0
        this.averageScore.set(UInt32.from(0));  // 初始平均评分为0
        this.scoreCount.set(UInt32.from(0));  // 初始评分次数为0
    }

    // 验证论文是否原创
    @method async verifyOriginality() {
        const original = await this.originality.getAndRequireEquals();
        original.assertEquals(Field(1)); // 1表示原创，0表示非原创
    }

    // 打分方法，接受评分
    @method async scorePaper(score: UInt32) {
        // 获取当前的总评分和评分次数
        const currentTotalScore = await this.totalScore.getAndRequireEquals();
        const currentScoreCount = await this.scoreCount.getAndRequireEquals();

        // 更新总评分
        this.totalScore.set(currentTotalScore.add(score));
        this.scoreCount.set(currentScoreCount.add(UInt32.from(1)));
    }

    // 计算当前平均评分，返回整数
    @method async setAverageScore() {
        const currentTotalScore = await this.totalScore.getAndRequireEquals();
        const currentScoreCount = await this.scoreCount.getAndRequireEquals();

        // 确保评分次数大于零但小于等于10
        currentScoreCount.assertGreaterThan(UInt32.from(0));
        currentScoreCount.assertLessThanOrEqual(UInt32.from(10));

        // 计算平均值，直接为整数，不需要任何放大
        const average = currentTotalScore.div(currentScoreCount);

        // 将结果保存
        this.averageScore.set(average);
    }

    @method.returns(UInt32) async getAverageScore() {
        return this.averageScore.getAndRequireEquals();
    }
}
