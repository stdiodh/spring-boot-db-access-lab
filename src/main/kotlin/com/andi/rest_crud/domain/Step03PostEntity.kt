// Step 03: 게시글 저장 컬럼 제약을 DTO 계약과 맞춥니다.
package com.andi.rest_crud.domain

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

    // TODO(Validation) title 컬럼 길이를 요청 DTO의 최대 길이와 맞추세요.
    var title: String,

    // TODO(Validation) content 5000자를 H2와 MySQL에서 모두 저장할 수 있게 매핑하세요.
    var content: String,

    // TODO(Validation) 인증 email을 저장하므로 User.email과 같은 최대 길이를 적용하세요.
    var author: String
) {
    fun update(title: String, content: String) {
        this.title = title
        this.content = content
    }
}
