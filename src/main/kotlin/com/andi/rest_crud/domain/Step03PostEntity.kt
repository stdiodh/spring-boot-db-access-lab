/*
 * 실습 순서 03 — 게시글 저장 계약
 * 선행 단계: Step01의 title/content Validation과 Step02의 email 길이를 확인합니다.
 * 이 단계의 판단: 요청 최대 길이와 작성자 식별값을 H2/MySQL 양쪽에서 같은 범위로 저장합니다.
 * 다음 연결: Step08이 인증된 email을 author로 기록하고 수정·삭제 전에 소유권을 비교합니다.
 */
package com.andi.rest_crud.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "posts")
class PostEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0L,

    // TODO(Validation) 요청 DTO와 같은 title 최대 길이를 지정하세요.
    @Column(nullable = false)
    var title: String,

    // TODO(Validation) H2와 MySQL에서 content 5000자를 저장할 수 있게 매핑하세요.
    @Column(nullable = false)
    var content: String,

    // TODO(Validation) User.email과 같은 author 최대 길이를 지정하세요.
    @Column(nullable = false)
    var author: String
) {
    // 쓰기 transaction 안에서 값을 바꾸면 JPA dirty checking이 반영하므로 Service에서 save를 반복하지 않습니다.
    fun update(title: String, content: String) {
        this.title = title
        this.content = content
    }

    // TODO(Authorization) 저장된 author와 인증된 email이 같은지 판단하세요.
    fun isWrittenBy(email: String): Boolean = TODO("게시글 작성자 비교를 완성하세요.")
}
